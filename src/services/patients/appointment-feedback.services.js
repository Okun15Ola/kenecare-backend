const feedbackRepository = require("../../repository/appointmentFeedbacks.repository");
const { redisClient } = require("../../config/redis.config");
const Response = require("../../utils/response.utils");
const logger = require("../../middlewares/logger.middleware");
const { mapAppointmentFeedback } = require("../../utils/db-mapper.utils");

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
    if (error.code === "ER_DUP_ENTRY" || error.errno === 1062) {
      console.error(
        `Feedback submission failed: Duplicate entry for appointment ${appointmentId}.`,
      );
      logger.error(
        `Feedback submission failed: Duplicate entry for appointment ${appointmentId}.`,
      );
      return Response.CONFLICT({
        message: "You have already submitted feedback for this appointment",
      });
    }
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

    const feedback = mapAppointmentFeedback(data);

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(feedback),
      expiry: 3600,
    });

    return Response.SUCCESS({ data: feedback });
  } catch (error) {
    logger.error("getAppointmentFeedbackService", error);
    throw error;
  }
};
