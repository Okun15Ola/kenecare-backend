const doctorReviewRepository = require("../../repository/doctorReviews.repository");
const { redisClient } = require("../../config/redis.config");
const Response = require("../../utils/response.utils");
const logger = require("../../middlewares/logger.middleware");
const {
  cacheKeyBulider,
  getCachedCount,
  getPaginationInfo,
} = require("../../utils/caching.utils");

exports.getAllDoctorReviewsService = async (page, limit) => {
  try {
    const offset = (page - 1) * limit;
    const countCacheKey = "reviews:count";
    const totalRows = await getCachedCount({
      cacheKey: countCacheKey,
      countQueryFn: doctorReviewRepository.countDoctorsReviews(),
    });

    if (!totalRows) {
      return Response.SUCCESS({
        message: "No reviews found",
        data: [],
      });
    }

    const paginationInfo = getPaginationInfo({ totalRows, limit, page });
    const cacheKey = cacheKeyBulider("reviews:all", limit, offset);
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({
        data: JSON.parse(cachedData),
        pagination: paginationInfo,
      });
    }
    const reviews = await doctorReviewRepository.getDoctorReviews(
      limit,
      offset,
    );

    if (!reviews?.length) {
      return Response.SUCCESS({
        message: "No reviews found for doctors.",
        data: [],
      });
    }

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(reviews),
      expiry: 3600,
    });

    return Response.SUCCESS({
      data: reviews,
    });
  } catch (error) {
    logger.error("getAllDoctorReviewsService", error);
    throw error;
  }
};

exports.updateDoctorReviewApprovalStatusService = async (
  reviewId,
  isApproved,
) => {
  try {
    const review = await doctorReviewRepository.getReviewById(reviewId);

    if (!review) {
      return Response.NOT_FOUND({
        message: "Review not found.",
      });
    }

    const { doctor_id: doctorId } = review;

    const { affectedRows } =
      await doctorReviewRepository.updateReviewApprovalStatus(
        reviewId,
        isApproved,
      );

    if (!affectedRows || affectedRows < 1) {
      logger.error(`Error updating approval status for Review ID: ${reviewId}`);
      return Response.INTERNAL_SERVER_ERROR({
        message: "Something went wrong. Please try again.",
      });
    }

    await Promise.all([
      redisClient.delete(`doctor:${doctorId}:reviews`),
      redisClient.clearCacheByPattern("reviews:all:*"),
      redisClient.delete("reviews:count"),
      redisClient.delete(`reviews:${reviewId}`),
    ]);

    return Response.SUCCESS({
      message: "Review approval status updated successfully.",
    });
  } catch (error) {
    logger.error("updateReviewApprovalStatusService", error);
    throw error;
  }
};

exports.getReviewByIdService = async (reviewId) => {
  try {
    const cacheKey = `reviews:${reviewId}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({
        data: JSON.parse(cachedData),
      });
    }

    const review = await doctorReviewRepository.getReviewById(reviewId);

    if (!review) {
      return Response.NOT_FOUND({
        message: "Review not found.",
      });
    }

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(review),
    });

    return Response.SUCCESS({
      data: review,
    });
  } catch (error) {
    logger.error("getReviewByIdService", error);
    throw error;
  }
};
