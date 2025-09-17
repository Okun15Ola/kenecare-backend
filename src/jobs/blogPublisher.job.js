const logger = require("../middlewares/logger.middleware");
const {
  publishScheduledBlogs,
} = require("../repository/doctorBlogs.repository");

module.exports = {
  schedule: "*/60 * * * *", // Every hour
  name: "blog-publisher",

  async execute() {
    try {
      logger.info("Running scheduled blog publishing job...");

      const { affectedRows } = await publishScheduledBlogs();

      if (affectedRows > 0) {
        logger.info(`Published ${affectedRows} scheduled blogs`);
      }
    } catch (error) {
      logger.error("Error in blog publishing job:", error);
    }
  },
};
