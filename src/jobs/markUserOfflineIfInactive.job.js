const logger = require("../middlewares/logger.middleware");
const { markUserOffline } = require("../repository/users.repository");

module.exports = {
  schedule: "*/3 * * * *", // Every 3 minutes
  name: "user-online-status",

  async execute() {
    try {
      await markUserOffline();
    } catch (error) {
      logger.error("Error in turning off user online status job:", error);
    }
  },
};
