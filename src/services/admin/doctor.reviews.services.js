const doctorReviewRepository = require("../../repository/doctorReviews.repository");
const { redisClient } = require("../../config/redis.config");
const Response = require("../../utils/response.utils");
const logger = require("../../middlewares/logger.middleware");
const {
  cacheKeyBulider,
  getPaginationInfo,
} = require("../../utils/caching.utils");
const { mapDoctorReview } = require("../../utils/db-mapper.utils");

exports.getAllDoctorReviewsService = async (page, limit) => {
  try {
    const offset = (page - 1) * limit;
    const cacheKey = cacheKeyBulider("reviews:all", limit, offset);
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      const { data, pagination } = JSON.parse(cachedData);
      return Response.SUCCESS({
        data,
        pagination,
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

    const { totalRows } = reviews[0];
    const paginationInfo = getPaginationInfo({ totalRows, limit, page });

    const data = await Promise.all(
      reviews.map((review) => mapDoctorReview(review, true)),
    );

    const valueToCache = {
      data,
      pagination: paginationInfo,
    };

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(valueToCache),
      expiry: 3600,
    });

    return Response.SUCCESS({
      data,
      pagination: paginationInfo,
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

    const { doctor_id: doctorId, patient_id: patientId } = review;

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
      redisClient.delete(`patient:${patientId}:doctor-reviews`),
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

    const data = await mapDoctorReview(review, true);

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(data),
    });

    return Response.SUCCESS({
      data,
    });
  } catch (error) {
    logger.error("getReviewByIdService", error);
    throw error;
  }
};
