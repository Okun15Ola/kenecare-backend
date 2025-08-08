const feedbackRepository = require("../../repository/appointmentFeedbacks.repository");
const { redisClient } = require("../../config/redis.config");
const Response = require("../../utils/response.utils");
const logger = require("../../middlewares/logger.middleware");

exports.addAppointmentFeedbackService = async (appointmentId, feedback) => {
  try {
    const { insertId } = await feedbackRepository.addAppointmentFeedback(
      appointmentId,
      feedback,
    );

    if (!insertId) {
      logger.error(
        "Error inserting appointment feedback for appointment Id: ",
        appointmentId,
      );
      return Response.INTERNAL_SERVER_ERROR({
        message: "Something went wrong. Please try again",
      });
    }

    return Response.CREATED({ message: "Feedback added successfully!" });
  } catch (error) {
    logger.error("addAppointmentFeedbackService", error);
    throw error;
  }
};

exports.getAppointmentFeedbackService = async (appointmentId) => {
  try {
    const cacheKey = `feedback:${appointmentId}`;
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }

    const data = await feedbackRepository.getAppointmentFeedback(appointmentId);

    if (!data) {
      logger.error(
        "No feedback found for appointment with Id: ",
        appointmentId,
      );
      return Response.NOT_FOUND({
        message: "No feedback found for this appointment.",
      });
    }

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(data),
      expiry: 3600,
    });

    return Response.SUCCESS({ data });
  } catch (error) {
    logger.error("addAppointmentFeedbackService", error);
    throw error;
  }
};
