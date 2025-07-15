const app = require("./app");
const { appPort, appBaseURL } = require("./config/default.config");
const { connectionPool } = require("./repository/db.connection");
const { startCron: runCron } = require("./utils/cron.utils");
require("./config/redis.config"); // Ensure Redis client is initialized
const logger = require("./middlewares/logger.middleware");

connectionPool.getConnection((err, connection) => {
  if (err) {
    logger.error(
      "❌ Error connecting to the database, exiting application:",
      err,
    );
    process.exit(1);
  } else {
    console.info("✅ Database connected Successfully");
    app.listen(appPort, (err) => {
      if (err) {
        logger.error("❌ There was an error running the server:", err);
      } else {
        console.info(`🚀 Server running on ${appBaseURL}:${appPort}`);
        runCron();
      }
    });
  }

  connection.on("error", (error) => {
    logger.error(error);
    logger.error("❌ Database connection error:", error.sqlMessage);
    process.exit(1);
  });
});
