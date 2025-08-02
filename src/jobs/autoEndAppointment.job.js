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
      logger.info("Running auto-end appointment job...");
      console.info("Running auto-end appointment job...");

      // Format current time for end_time
      const currentTime = moment().format("HH:mm:ss");
      const result = await batchUpdateEndTimeForOpenAppointments(currentTime);

      // Check if the query was successful
      if (result?.affectedRows) {
        logger.info(
          `Successfully auto-closed ${result.affectedRows} open appointments`,
        );
        console.info(
          `Successfully auto-closed ${result.affectedRows} open appointments`,
        );
      } else {
        logger.info("No open appointments found to auto-close");
        console.info("No open appointments found to auto-close");
      }
    } catch (error) {
      logger.error("Error in auto-end appointment job:", error);
      console.error("Error in auto-end appointment job:", error);
    }
  },
};
