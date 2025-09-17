const logger = require("../middlewares/logger.middleware");
const {
  getDoctorsPendingAppointmentsForToday,
} = require("../repository/doctorAppointments.repository");
const smsUtils = require("../utils/sms.utils");

module.exports = {
  schedule: "0 1 * * *", // Daily at 1:00 AM
  name: "pending-appointments-notifier",

  async execute() {
    try {
      logger.info("Running pending appointments notifier job...");
      console.info("Running pending appointments notifier job...");

      // Fetch all pending appointments for today
      const appointments = await getDoctorsPendingAppointmentsForToday();

      if (appointments && appointments.length > 0) {
        // Group by doctor_id
        const doctorMap = {};
        appointments.forEach((appt) => {
          if (!doctorMap[appt.doctor_id]) {
            doctorMap[appt.doctor_id] = {
              doctor: {
                id: appt.doctor_id,
                firstName: appt.doctor_first_name,
                lastName: appt.doctor_last_name,
                mobile: appt.doctor_mobile_number,
              },
              count: 0,
            };
          }
          doctorMap[appt.doctor_id].count += 1;
        });

        // Send SMS to each doctor concurrently
        await Promise.all(
          Object.values(doctorMap).map(async ({ doctor, count }) => {
            await smsUtils.sendDoctorPendingAppointmentSMS({ doctor, count });
            logger.info(
              `Sent pending appointments SMS to Dr. ${doctor.firstName} ${doctor.lastName} (${doctor.mobile}): ${count} appointments`,
            );
          }),
        );
      } else {
        logger.info("No pending appointments found for today");
        console.info("No pending appointments found for today");
      }
    } catch (error) {
      logger.error("Error in pending appointments notifier job:", error);
      console.error("Error in pending appointments notifier job:", error);
    }
  },
};
