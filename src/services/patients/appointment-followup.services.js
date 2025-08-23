const followUpRepo = require("../../repository/follow-up.repository");
const Response = require("../../utils/response.utils");
const { redisClient } = require("../../config/redis.config");
const { mapFollowUpRow } = require("../../utils/db-mapper.utils");
const logger = require("../../middlewares/logger.middleware");

exports.getPatientAppointmentFollowupService = async ({ appointmentId }) => {
  try {
    const cacheKey = `appointment:$${appointmentId}:follow-up`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }

    const rawData = await followUpRepo.getAppointmentFollowUps(appointmentId);

    if (!rawData?.length) {
      return Response.SUCCESS({ message: "No follow-ups found", data: [] });
    }

    const followUps = rawData.map(mapFollowUpRow);

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(followUps),
    });
    return Response.SUCCESS({
      data: followUps,
    });
  } catch (error) {
    logger.error("getPatientAppointmentFollowupService: ", error);
    throw error;
  }
};
