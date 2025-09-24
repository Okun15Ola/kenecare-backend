const moment = require("moment");
const logger = require("../middlewares/logger.middleware");
const {
  batchUpdateEndTimeForOpenAppointments,
} = require("../repository/doctorAppointments.repository");

module.exports = {
  schedule: "0 1 * * *", // Daily at 1:00 AM
  name: "auto-end-appointment",

  async execute() {
    try {
      const currentTime = moment().format("HH:mm:ss");
      await batchUpdateEndTimeForOpenAppointments(currentTime);
    } catch (error) {
      logger.error("Error in auto-end appointment job:", error);
    }
  },
};
