const moment = require("moment");
const logger = require("../middlewares/logger.middleware");
const {
  getDoctorsApprovedAppointmentsForToday,
} = require("../repository/doctorAppointments.repository");
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
          await smsUtils.sendApproveAppointmentReminderSMS({
            mobileNumber: doctorMobile,
            doctorName,
            appointmentDateTime,
            diffInMinutes,
          });
        } catch (err) {
          logger.error(`Failed to send SMS to ${doctorMobile}:`, err);
        }
      },
    ),
  );
};

module.exports = {
  schedule: "*/5 * * * *", // Every 5 minutes
  name: "approved-appointment-notifier",

  async execute() {
    try {
      const appointments = await getDoctorsApprovedAppointmentsForToday();
      const currentDateTime = moment();
      const notifications = [];
      appointments.forEach(
        ({
          appointment_date: appointmentDate,
          appointment_time: appointmentTime,
          doctor_mobile_number: doctorMobile,
          doctor_last_name: doctorName,
        }) => {
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
              diffInMinutes === 1
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
    } catch (error) {
      logger.error("Error in approved appointmenta notification job:", error);
    }
  },
};
