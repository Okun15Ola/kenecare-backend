const app = require("./app");
const { appPort } = require("./config/default.config");
const { connectionPool } = require("./db/db.connection");

connectionPool.getConnection((err, connection) => {
  if (err) {
    console.error(
      "Error connecting to the database, exiting application:",
      err
    );
    process.exit(1);
  } else {
    console.info("Database connected Successfully");
    app.listen(appPort, (err) => {
      if (err) {
        console.error("There was an error running the server:", err);
      } else {
        console.info(`Server running on http://localhost:${appPort}`);
      }
    });
  }

  connection.on("error", (error) => {
    console.error(error);
    console.error("Database connection error:", error.sqlMessage);
    process.exit(1);
  });
});
