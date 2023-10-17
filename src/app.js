// const mysql = require("mysql");
// const bCrypt = require("bcryptjs");
// const multer = require("multer");
// const http = require("http").Server(app);
// const hostname = process.env.HOST;
// const PORT = process.env.PORT;
// const expressValidator = require("express-validator");
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const expressSession = require("express-session");
const path = require("path");
const bodyParser = require("body-parser");
const apirouter = require("./routes/api/apiroute");
const adminrouter = require("./routes/api/admin/adminrouter");
const authRouter = require("./routes/api/auth.routes");
const flash = require("req-flash");
const { sessionSecret } = require("./config/default.config");
const { connectionPool } = require("./db/db.connection.js");
const {
  NOT_FOUND,
  INTERNAL_SERVER_ERROR,
} = require("./utils/response.utils.js");
const logUserInteraction = require("./middlewares/audit-log.middlewares.js");
const logger = require("./middlewares/logger.middleware");

global.BASE_URL = process.env.BASE_URL;
global.API_BASE_URL = process.env.API_BASE_URL;
global.FRONTEND_URL = process.env.FRONTEND_URL;
global.UPLOAD_DIR = "public/upload/";
global.connectPool = connectionPool;
global.__basedir = __dirname;
global.dateAndTime = require("date-and-time");
global.nodemailer = require("nodemailer");
global.mailerConfig = require("./config/mailer.config.js");
global.html_entities = require("./controllers/helpers/html_entities");
global.jwt = require("jsonwebtoken");
global.jwtConfig = require("./config/auth.jwtConfig.js");

const app = express();

app.use(cors());
app.use(
  helmet({
    hidePoweredBy: true,
    crossOriginResourcePolicy: false,
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// app.use("public", express.static("public"));
app.use(express.static(__dirname + "/public"));
app.use(
  expressSession({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true,
  })
);

// connectPool.on("error", function (err) {
//   console.log("[mysql error]", err);
// });

app.use(flash());

//For set layouts of html view
//const expressLayouts = require('express-ejs-layouts');
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
//app.use(expressLayouts);

app.use(function (req, res, next) {
  if (!req.path.includes("/api/")) {
    global.session_user_id = "";
    global.session_user_full_name = "";
    if (typeof req.session.userID !== "undefined") {
      global.session_user_id = req.session.userID;
      global.session_user_full_name = req.session.userFullName;
    }
  }
  next();
});

// app.use("/", logUserInteraction, adminrouter);
// app.use("/api", logUserInteraction, apirouter);
// app.use("api/admin", adminrouter);

app.use("/api/v1/auth", logUserInteraction, authRouter);

// Catch-all route for handling unknown routes
app.use((req, res, next) => {
  const err = new Error("Not Found");
  err.code = 404;
  next(err);
});
app.use((err, req, res, next) => {
  logger.error(err);
  let statusCode = 500;
  let errorMessage = "Internal Server Error";
  if (err.code === 404) {
    statusCode = 404;
    errorMessage = "The requested resource could not be found.";
    return res.status(statusCode).json(NOT_FOUND({ message: errorMessage }));
  }

  return res
    .status(statusCode)
    .json(INTERNAL_SERVER_ERROR({ message: errorMessage }));
});

module.exports = app;
