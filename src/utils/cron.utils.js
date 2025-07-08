const { CronJob } = require("cron");
const moment = require("moment");
const {
  getAppointments,
} = require("../repository/adminAppointments.repository");
const logger = require("../middlewares/logger.middleware");
const { redisClient } = require("../config/redis.config");

const sendPushNotifications = (notifications) => {
  notifications.forEach(({ appointmentDateTime, diffInMinutes }) => {
    console.log(
      `Sending push notification for appointment at ${appointmentDateTime}, ${diffInMinutes} minutes remaining.`,
    );
    // Implement push notification logic here
  });
};

const getAllAppointments = async () => {
  try {
    let appointments = null;
    const cacheKey = "appointments:all";
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      appointments = JSON.parse(cachedData);
    } else {
      appointments = await getAppointments();
      await redisClient.set({
        key: cacheKey,
        expiry: 600,
        value: JSON.stringify(appointments),
      });
    }

    const currentDateTime = moment();
    const notifications = [];
    appointments.forEach(
      ({
        appointment_status: appointmentStatus,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
      }) => {
        if (appointmentStatus !== "pending") return;

        const appointmentDateTime = moment(
          `${appointmentDate} ${appointmentTime}`,
          "YYYY-MM-DD HH:mm:ss",
        );

        if (currentDateTime.isSame(appointmentDateTime, "day")) {
          const diffInMinutes = appointmentDateTime.diff(
            currentDateTime,
            "minutes",
          );

          if (diffInMinutes === 30 || diffInMinutes === 5) {
            notifications.push({
              appointmentDateTime: appointmentDateTime.format(
                "YYYY-MM-DD HH:mm:ss",
              ),
              diffInMinutes,
            });
          }
        }
      },
    );

    // Process notifications in batch
    if (notifications.length > 0) {
      sendPushNotifications(notifications);
    }
  } catch (error) {
    console.log(error);
    logger.error("CRON ERROR: ", error);
    throw error;
  }
};
let cronJobInstance;

module.exports = {
  startCron: () => {
    if (cronJobInstance) {
      logger.info("Cron job is already running...");
      console.info("Cron job is already running...");
      return;
    }

    cronJobInstance = new CronJob(
      "*/5 * * * *",
      async () => {
        try {
          logger.info("Running appointment notification cron job...");
          console.info("Running appointment notification cron job...");
          await getAllAppointments();
          logger.info("Appointment cron job completed....");
          console.info("Appointment cron job completed....");
        } catch (error) {
          logger.error("Error in cron job:", error);
        }
      },
      null, // no need for onComplete callback
      false,
      "UTC",
    );
    logger.info("Cron job started successfully");
  },

  stopCron: () => {
    if (cronJobInstance) {
      cronJobInstance.stop();
      cronJobInstance = null;
      logger.info("Cron job stopped");
    } else {
      logger.info("No active cron job to stop");
    }
  },
};
