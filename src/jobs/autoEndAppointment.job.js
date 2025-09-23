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
      // Format current time for end_time
      const currentTime = moment().format("HH:mm:ss");
      const result = await batchUpdateEndTimeForOpenAppointments(currentTime);

      // Check if the query was successful
      if (!result.affectedRows > 0) {
        logger.error(`Fail to auto-closed open appointments ${result}`);
      }
    } catch (error) {
      logger.error("Error in auto-end appointment job:", error);
    }
  },
};
