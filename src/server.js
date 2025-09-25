const app = require("./app");
const { appPort, appBaseURL } = require("./config/default.config");
const { connectionPool } = require("./repository/db.connection");
const cronUtils = require("./utils/cron.utils");
const logger = require("./middlewares/logger.middleware");
require("./config/redis.config"); // Ensure Redis client is initialized

connectionPool.getConnection((err, connection) => {
  if (err) {
    logger.error(
      "[DB CONNECTION ERROR]: Error connecting to the database, exiting application:",
      err,
    );
    console.error(
      "❌ [DB CONNECTION ERROR]: Error connecting to the database, exiting application:",
      err,
    );
    process.exit(1);
  } else {
    console.info("✅ Database connected Successfully");
    app.listen(appPort, (err) => {
      if (err) {
        console.error(
          "❌ [SERVER CONNECTION ERROR]: There was an error running the server:",
          err,
        );
        logger.error(
          "❌ [SERVER CONNECTION ERROR]: There was an error running the server:",
          err,
        );
      } else {
        console.info(`🚀 Server running on ${appBaseURL}:${appPort}`);
        // init all cron jobs when server starts
        cronUtils.startAllCronJobs();
      }
    });
  }

  connection.on("error", (error) => {
    logger.error(
      "[DB CONNECTION ERROR]: Error connecting to the database",
      error,
    );
    console.error(error);
    console.error("❌ Database connection error:", error.sqlMessage);
    process.exit(1);
  });
});
