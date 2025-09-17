const doctorReviewRepository = require("../../repository/doctorReviews.repository");
const { getPatientByUserId } = require("../../repository/patients.repository");
const { redisClient } = require("../../config/redis.config");
const Response = require("../../utils/response.utils");
const logger = require("../../middlewares/logger.middleware");
const { mapDoctorReview } = require("../../utils/db-mapper.utils");

exports.addDoctorReviewService = async (userId, doctorId, review) => {
  try {
    const { patient_id: patientId } = await getPatientByUserId(userId);

    if (!patientId) {
      logger.warn(`Patient Profile Not Found for user ${userId}`);
      return Response.NOT_FOUND({
        message:
          "Patient profile not found please, create profile before proceeding",
      });
    }
    const { insertId } = await doctorReviewRepository.addDoctorReview(
      patientId,
      doctorId,
      review,
    );

    if (!insertId) {
      logger.error("Error inserting doctor review for patient Id: ", patientId);
      return Response.INTERNAL_SERVER_ERROR({
        message: "Something went wrong. Please try again",
      });
    }

    const cacheKey = `patient:${patientId}:doctor-reviews`;
    await redisClient.delete(cacheKey);

    return Response.CREATED({ message: "Review added successfully!" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY" || error.errno === 1062) {
      console.error(
        `Feedback submission failed: Duplicate entry for doctor ${doctorId}.`,
      );
      logger.error(
        `Feedback submission failed: Duplicate entry for doctor ${doctorId}.`,
      );
      return Response.CONFLICT({
        message: "You have already submitted feedback for this doctor",
      });
    }
    logger.error("addDoctorReviewService", error);
    throw error;
  }
};

exports.getPatientReviewsService = async (userId) => {
  try {
    const { patient_id: patientId } = await getPatientByUserId(userId);

    if (!patientId) {
      logger.warn(`Patient Profile Not Found for user ${userId}`);
      return Response.NOT_FOUND({
        message:
          "Patient profile not found. Please create a profile before proceeding.",
      });
    }

    const cacheKey = `patient:${patientId}:doctor-reviews`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }

    const reviews =
      await doctorReviewRepository.getDoctorReviewsByPatientId(patientId);

    if (!reviews?.length) {
      return Response.SUCCESS({
        message: "No reviews found for this patient.",
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
    logger.error("getPatientReviewsService: ", error);
    throw error;
  }
};
