const logger = require("../middlewares/logger.middleware");
const { generateDoctorTimeSlots } = require("../utils/time.utils");

module.exports = {
  schedule: "0 0 * * 0", // Every Sunday at midnight
  name: "time-slot-generator",

  async execute() {
    try {
      logger.info("Running doctor time slot generation job...");
      console.info("Running doctor time slot generation job...");

      const result = await generateDoctorTimeSlots();

      if (result.success) {
        logger.info(`Time slot generation completed: ${result.message}`);
        console.info(`Time slot generation completed: ${result.message}`);
      } else {
        logger.error(`Time slot generation failed: ${result.message}`);
        console.error(`Time slot generation failed: ${result.message}`);
      }
    } catch (error) {
      logger.error("Error in time slot generation job:", error);
      console.error("Error in time slot generation job:", error);
    }
  },
};
