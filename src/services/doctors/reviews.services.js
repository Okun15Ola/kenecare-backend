const doctorReviewRepository = require("../../repository/doctorReviews.repository");
const { getDoctorByUserId } = require("../../repository/doctors.repository");
const { redisClient } = require("../../config/redis.config");
const Response = require("../../utils/response.utils");
const logger = require("../../middlewares/logger.middleware");

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

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(reviews),
    });

    return Response.SUCCESS({
      data: reviews,
    });
  } catch (error) {
    logger.error("getApprovedDoctorReviewsService", error);
    throw error;
  }
};
