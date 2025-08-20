const logger = require("../middlewares/logger.middleware");
const { markUserOffline } = require("../repository/users.repository");

module.exports = {
  schedule: "*/3 * * * *", // Every 3 minutes
  name: "user-online-status",

  async execute() {
    try {
      logger.info("Running user online status job...");
      console.info("Running user online status job...");

      const { affectedRows } = await markUserOffline();

      if (affectedRows > 0) {
        logger.info(
          `Turned off ${affectedRows} inactive user${affectedRows > 1 ? "s" : ""}`,
        );
        console.info(
          `Turned off ${affectedRows} inactive user${affectedRows > 1 ? "s" : ""}`,
        );
      } else {
        logger.info("No inactive user at this time");
        console.info("No inactive user at this time");
      }
    } catch (error) {
      logger.error("Error in turning off user online status job:", error);
      console.error("Error in turning off user online status job:", error);
    }
  },
};
