const moment = require("moment");
const logger = require("../middlewares/logger.middleware");
const {
  getAppointments,
} = require("../repository/adminAppointments.repository");
const { redisClient } = require("../config/redis.config");

// Helper function for notifications
const sendPushNotifications = (notifications) => {
  notifications.forEach(({ appointmentDateTime, diffInMinutes }) => {
    logger.info(
      `Sending push notification for appointment at ${appointmentDateTime}, ${diffInMinutes} minutes remaining.`,
    );
    console.info(
      `Sending push notification for appointment at ${appointmentDateTime}, ${diffInMinutes} minutes remaining.`,
    );
    // Implement push notification logic here
  });
};

module.exports = {
  schedule: "*/5 * * * *", // Every 5 minutes
  name: "appointment-notifier",

  async execute() {
    try {
      logger.info("Running appointment notification job...");
      console.info("Running appointment notification job...");

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

      logger.info("Appointment notification job completed");
      console.info("Appointment notification job completed");
    } catch (error) {
      logger.error("Error in appointment notification job:", error);
      console.error("Error in appointment notification job:", error);
    }
  },
};
