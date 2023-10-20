require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const expressSession = require("express-session");
const path = require("path");
const bodyParser = require("body-parser");
const flash = require("req-flash");
const { sessionSecret } = require("./config/default.config");
const { connectionPool } = require("./db/db.connection.js");
const logUserInteraction = require("./middlewares/audit-log.middlewares.js");
const logger = require("./middlewares/logger.middleware");
const {
  requireUserAuth,
  requireAdminAuth,
} = require("./middlewares/auth.middleware");
const {
  NOT_FOUND,
  INTERNAL_SERVER_ERROR,
} = require("./utils/response.utils.js");
//API ROUTES
const authRouter = require("./routes/api/auth.routes");
const adminDoctorsRoute = require("./routes/api/admin/doctors.routes");
const adminSpecializationsRoute = require("./routes/api/admin/specializations.routes");
const adminAuthRouter = require("./routes/api/admin/auth.admin.routes");
const adminAccountsRouter = require("./routes/api/admin/admin.accounts.routes");
const adminBlogCategoriesRouter = require("./routes/api/admin/blog-category.routes");
const adminBlogsRouter = require("./routes/api/admin/blogs.routes");
const adminCitiesRouter = require("./routes/api/admin/cities.routes");
const adminServicesRouter = require("./routes/api/admin/services.routes");
const adminSymptomsRouter = require("./routes/api/admin/common-symptoms.routes");

//DASHBOARD ROUTES
const dashboardRouter = require("./routes/dashboard.routes");

// global.BASE_URL = process.env.BASE_URL;
// global.API_BASE_URL = process.env.API_BASE_URL;
// global.FRONTEND_URL = process.env.FRONTEND_URL;
// global.UPLOAD_DIR = "public/upload/";
// global.connectPool = connectionPool;
// global.__basedir = __dirname;
// global.dateAndTime = require("date-and-time");
// global.nodemailer = require("nodemailer");
// global.mailerConfig = require("./config/mailer.config.js");
// global.html_entities = require("./controllers/helpers/html_entities");
// global.jwt = require("jsonwebtoken");
// global.jwtConfig = require("./config/auth.jwtConfig.js");

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

app.use(logUserInteraction);

//DASHBOARD
app.use("/", dashboardRouter);
//USERS ROUTES
app.use("/api/v1/auth", authRouter);

//ADMIN ROUTES
//TODO Add a middle ware to authenticate ADMIN JWT
app.use("/api/v1/admin/auth", adminAuthRouter);
app.use("/api/v1/admin/accounts", adminAccountsRouter);
app.use("/api/v1/admin/appointments", adminAccountsRouter);
app.use("/api/v1/admin/blog-categories", adminBlogCategoriesRouter);
app.use("/api/v1/admin/blogs", requireAdminAuth, adminBlogsRouter);
app.use("/api/v1/admin/cities", adminCitiesRouter);
app.use("/api/v1/admin/symptoms", adminSymptomsRouter);
app.use("/api/v1/admin/doctors", adminDoctorsRoute);
app.use("/api/v1/admin/faqs", adminAccountsRouter);
app.use("/api/v1/admin/medical-councils", adminAccountsRouter);
app.use("/api/v1/admin/services", adminServicesRouter);
app.use("/api/v1/admin/specializations", adminSpecializationsRoute);
app.use("/api/v1/admin/specialties", adminSpecializationsRoute);
app.use("/api/v1/admin/user-types", adminAccountsRouter);

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

  console.log(err);
  return res
    .status(statusCode)
    .json(INTERNAL_SERVER_ERROR({ message: errorMessage }));
});

module.exports = app;
