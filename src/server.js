const app = require("./app");
const { appPort, appBaseURL } = require("./config/default.config");
const { connectionPool } = require("./repository/db.connection");
const {
  startAppointmentCron: runCron,
  startTimeSlotCron,
  startAutoEndAppointmentCron,
} = require("./utils/cron.utils");
const { generateDoctorTimeSlots } = require("./utils/time.utils");
require("./config/redis.config"); // Ensure Redis client is initialized

connectionPool.getConnection((err, connection) => {
  if (err) {
    console.error(
      "❌ Error connecting to the database, exiting application:",
      err,
    );
    process.exit(1);
  } else {
    console.info("✅ Database connected Successfully");
    app.listen(appPort, (err) => {
      if (err) {
        console.error("❌ There was an error running the server:", err);
      } else {
        console.info(`🚀 Server running on ${appBaseURL}:${appPort}`);
        runCron();
        startTimeSlotCron();

        // Run doctor time slot generation on server startup
        console.info("🏥 Initializing doctor time slots...");
        generateDoctorTimeSlots()
          .then((result) => {
            if (result.success) {
              console.info(
                `✅ Time slot initialization complete: ${result.message}`,
              );
            } else {
              console.error(
                `❌ Time slot initialization failed: ${result.message}`,
              );
            }
          })
          .catch((error) => {
            console.error("❌ Error during time slot initialization:", error);
          });

        startAutoEndAppointmentCron();
      }
    });
  }

  connection.on("error", (error) => {
    console.error(error);
    console.error("❌ Database connection error:", error.sqlMessage);
    process.exit(1);
  });
});
