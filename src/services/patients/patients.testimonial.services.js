const logger = require("../../middlewares/logger.middleware");
const testimonialRepository = require("../../repository/testimonials.repository");
const patientRepository = require("../../repository/patients.repository");
const Response = require("../../utils/response.utils");
const { redisClient } = require("../../config/redis.config");
const { mapTestimonialRow } = require("../../utils/db-mapper.utils");

exports.createTestimonialService = async ({ userId, content }) => {
  try {
    const patient = await patientRepository.getPatientByUserId(userId);

    if (!patient) {
      logger.warn("Patient Not Found");
      return Response.NOT_FOUND({
        message: "Patient Not Found.",
      });
    }
    const { patient_id: patientId } = patient;
    const { insertId } = await testimonialRepository.createNewTestimonial({
      patientId,
      content,
    });

    if (!insertId) {
      logger.warn("Failed to create testimonial");
      return Response.INTERNAL_SERVER_ERROR({
        message: "Testimonial Not Created",
      });
    }

    await redisClient.clearCacheByPattern("testimonials:*");
    await redisClient.delete(`patient:${patientId}:testimonial`);

    return Response.CREATED({ message: "Testimonial Created Successfully" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY" || error.errno === 1062) {
      console.error(
        `Testimonial submission failed: Duplicate entry for user ${userId}.`,
      );
      logger.error(
        `Testimonial submission failed: Duplicate entry for user ${userId}.`,
      );
      return Response.CONFLICT({
        message: "You have already submitted a testimonial",
      });
    }
    logger.error("createTestimonial: ", error);
    throw error;
  }
};

exports.getPatientTestimonialService = async (userId) => {
  try {
    const patient = await patientRepository.getPatientByUserId(userId);

    if (!patient) {
      logger.warn("Patient Not Found");
      return Response.NOT_FOUND({
        message: "Patient Not Found.",
      });
    }
    const { patient_id: patientId } = patient;

    const cacheKey = `patient:${patientId}:testimonial`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }

    const rawData =
      await testimonialRepository.getTestimonialByPatientId(patientId);

    if (!rawData) {
      logger.warn("Testimonial Not Found");
      return Response.NOT_FOUND({
        message: "You haven't submitted a testimonial yet",
      });
    }

    const testimonial = await mapTestimonialRow(rawData, true, false);
    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(testimonial),
      expiry: 3600,
    });
    return Response.SUCCESS({ data: testimonial });
  } catch (error) {
    logger.error("getPatientTestimonialService: ", error);
    throw error;
  }
};
