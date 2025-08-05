const moment = require("moment");
const logger = require("../middlewares/logger.middleware");
const {
  getAppointments,
} = require("../repository/adminAppointments.repository");
const { redisClient } = require("../config/redis.config");
const smsUtils = require("../utils/sms.utils");

const sendSmsNotifications = async (notifications) => {
  await Promise.all(
    notifications.map(
      async ({
        appointmentDateTime,
        diffInMinutes,
        doctorMobile,
        doctorName,
      }) => {
        try {
          await smsUtils.sendPendingAppointmentReminderSMS({
            mobileNumber: doctorMobile,
            doctorName,
            appointmentDateTime,
            diffInMinutes,
          });
          logger.info(
            `Sent SMS reminder to ${doctorName} (${doctorMobile}) for appointment at ${appointmentDateTime}, ${diffInMinutes} minutes remaining.`,
          );
        } catch (err) {
          logger.error(`Failed to send SMS to ${doctorMobile}:`, err);
        }
      },
    ),
  );
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
          expiry: 100,
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
          doctor_mobile_number: doctorMobile,
          doc_last_name: doctorName,
        }) => {
          if (appointmentStatus !== "pending") {
            return;
          }
          const formattedDate = moment(appointmentDate).format("YYYY-MM-DD");
          const appointmentDateTime = moment(
            `${formattedDate} ${appointmentTime}`,
            "YYYY-MM-DD HH:mm:ss",
          );

          if (currentDateTime.isSame(appointmentDateTime, "day")) {
            const diffInMinutes = appointmentDateTime.diff(
              currentDateTime,
              "minutes",
            );

            if (
              diffInMinutes === 60 ||
              diffInMinutes === 30 ||
              diffInMinutes === 5
            ) {
              notifications.push({
                appointmentDateTime: appointmentDateTime.format(
                  "dddd, MMMM Do YYYY [at] h:mm A",
                ),
                diffInMinutes,
                doctorMobile,
                doctorName,
              });
            }
          }
        },
      );

      // Send SMS notifications in batch
      if (notifications.length > 0) {
        sendSmsNotifications(notifications);
      }

      logger.info("Appointment notification job completed");
      console.info("Appointment notification job completed");
    } catch (error) {
      logger.error("Error in appointment notification job:", error);
      console.error("Error in appointment notification job:", error);
    }
  },
};
