const doctorReviewRepository = require("../../repository/doctorReviews.repository");
const { getDoctorByUserId } = require("../../repository/doctors.repository");
const { redisClient } = require("../../config/redis.config");
const Response = require("../../utils/response.utils");
const logger = require("../../middlewares/logger.middleware");
const { mapDoctorReview } = require("../../utils/db-mapper.utils");
const {
  cacheKeyBulider,
  getPaginationInfo,
} = require("../../utils/caching.utils");

exports.getApprovedDoctorReviewsService = async (userId) => {
  try {
    const { doctor_id: doctorId } = await getDoctorByUserId(userId);

    if (!doctorId) {
      logger.warn(`Doctor Profile Not Found for user ${userId}`);
      return Response.NOT_FOUND({
        message:
          "Doctor profile not found please, create profile before proceeding",
      });
    }

    const cacheKey = `doctor:${doctorId}:reviews`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }

    const reviews =
      await doctorReviewRepository.getApprovedDoctorReviewsByDoctorId(doctorId);

    if (!reviews?.length) {
      return Response.SUCCESS({
        message: "No reviews found for this doctor.",
        data: [],
      });
    }

    const data = reviews.map(mapDoctorReview);

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(data),
    });

    return Response.SUCCESS({
      data,
    });
  } catch (error) {
    logger.error("getApprovedDoctorReviewsService", error);
    throw error;
  }
};

exports.getApprovedDoctorReviewsIndexService = async (
  doctorId,
  limit,
  page,
) => {
  try {
    const offset = (page - 1) * limit;

    const cacheKey = cacheKeyBulider(
      `doctor:${doctorId}:reviews`,
      limit,
      offset,
    );
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      const { data, pagination } = JSON.parse(cachedData);
      return Response.SUCCESS({ data, pagination });
    }

    const reviews =
      await doctorReviewRepository.getApprovedDoctorReviewsByDoctorId(
        doctorId,
        limit,
        offset,
      );

    if (!reviews?.length) {
      return Response.SUCCESS({
        message: "No reviews found for this doctor.",
        data: [],
      });
    }

    const { totalRows } = reviews[0];

    const paginationInfo = getPaginationInfo({ totalRows, limit, page });

    const data = await Promise.all(
      reviews.map((review) => mapDoctorReview(review, false, true)),
    );

    const valueToCache = {
      data,
      pagination: paginationInfo,
    };

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(valueToCache),
    });

    return Response.SUCCESS({
      data,
      pagination: paginationInfo,
    });
  } catch (error) {
    logger.error("getApprovedDoctorReviewsIndexService", error);
    throw error;
  }
};
