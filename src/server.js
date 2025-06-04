const app = require("./app");
const { appPort, appBaseURL } = require("./config/default.config");
const { connectionPool } = require("./repository/db.connection");
const { startCron: runCron } = require("./utils/cron.utils");

connectionPool.getConnection((err, connection) => {
  if (err) {
    console.error(
      "Error connecting to the database, exiting application:",
      err,
    );
    process.exit(1);
  } else {
    console.info("Database connected Successfully");
    app.listen(appPort, (err) => {
      if (err) {
        console.error("There was an error running the server:", err);
      } else {
        console.info(`Server running on ${appBaseURL}:${appPort}`);
        runCron();
      }
    });
  }

  connection.on("error", (error) => {
    console.error(error);
    console.error("Database connection error:", error.sqlMessage);
    process.exit(1);
  });
});
