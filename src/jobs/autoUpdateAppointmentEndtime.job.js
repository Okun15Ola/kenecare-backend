const logger = require("../middlewares/logger.middleware");
const {
  autoUpdateAppointmentEndtime,
} = require("../repository/doctorAppointments.repository");

module.exports = {
  schedule: "*/2 * * * *", // Every 2 minutes
  name: "auto-update-appointment-endtime",

  async execute() {
    try {
      await autoUpdateAppointmentEndtime();
    } catch (error) {
      logger.error("Error in auto-update-appointment-endtime job:", error);
    }
  },
};
