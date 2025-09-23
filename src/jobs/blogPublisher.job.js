const logger = require("../middlewares/logger.middleware");
const {
  publishScheduledBlogs,
} = require("../repository/doctorBlogs.repository");

module.exports = {
  schedule: "*/60 * * * *", // Every hour
  name: "blog-publisher",

  async execute() {
    try {
      await publishScheduledBlogs();
    } catch (error) {
      logger.error("Error in blog publishing job:", error);
    }
  },
};
