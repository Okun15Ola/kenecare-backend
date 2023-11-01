require("dotenv").config();
const express = require("express");
const ejsLayout = require("express-ejs-layouts");
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
  BAD_REQUEST,
} = require("./utils/response.utils.js");
//API ROUTES
const authRouter = require("./routes/api/auth.routes");
const doctorsRouter = require("./routes/api/doctors/profile.routes");
const adminDoctorsRoute = require("./routes/api/admin/doctors.routes");
const adminSpecializationsRoute = require("./routes/api/admin/specializations.routes");
const adminAuthRouter = require("./routes/api/admin/auth.admin.routes");
const adminAccountsRouter = require("./routes/api/admin/admin.accounts.routes");
const adminBlogCategoriesRouter = require("./routes/api/admin/blog-category.routes");
const adminBlogsRouter = require("./routes/api/admin/blogs.routes");
const adminCitiesRouter = require("./routes/api/admin/cities.routes");
const adminServicesRouter = require("./routes/api/admin/services.routes");
const adminSymptomsRouter = require("./routes/api/admin/common-symptoms.routes");
const adminSpecialtiesRouter = require("./routes/api/admin/specialties.routes");
const adminFaqRouter = require("./routes/api/admin/faq.routes");
const adminMedicalCouncilRouter = require("./routes/api/admin/medical-council.routes");

//DASHBOARD ROUTES
const dashboardRouter = require("./routes/dashboard.routes");

// const testRouter = require("./routes/test.routes");

// const admin_dashboardRouter = require("./routes/admin_dashboard.routes");

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
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/public/upload/media"));
app.use(
  expressSession({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(flash());

//View Engine Middleware
app.set("view engine", "ejs");
app.use(ejsLayout);
app.set("views", path.join(__dirname, "views"));

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

// app.use(logUserInteraction);

//DASHBOARD
app.use("/", dashboardRouter);

// app.get('/login', (req, res) => {
//   res.render('login', {
//       // Your login data here
//   }, (err, html) => {
//       res.render('login_layout', {
//           body: html,
//       });
//   });
// });


// app.use("/test1", testRouter);

// app.use("/admin_Dashboard", admin_dashboardRouter);

//USERS ROUTES
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/doctors", requireUserAuth, doctorsRouter);

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
app.use("/api/v1/admin/faqs", adminFaqRouter);
app.use("/api/v1/admin/medical-councils", adminMedicalCouncilRouter);
app.use("/api/v1/admin/services", adminServicesRouter);
app.use("/api/v1/admin/specializations", adminSpecializationsRoute);
app.use("/api/v1/admin/specialties", adminSpecialtiesRouter);
app.use("/api/v1/admin/user-types", adminAccountsRouter);

// Catch-all route for handling unknown routes
app.use((req, res, next) => {
  const err = new Error("Not Found");
  err.code = 404;
  next(err);
});

// app.use((err, req, res, next) => {

//   logger.error(err);
//   let statusCode = 500;
//   let errorMessage = "Internal Server Error";

//   if (err.code === 404) {
//     statusCode = 404;
//     errorMessage = "The requested resource could not be found.";

//     return res.status(statusCode).json(NOT_FOUND({ message: errorMessage }));

//   }

//   console.log(err);
//   return res
//     .status(statusCode)
//     .json(INTERNAL_SERVER_ERROR({ message: errorMessage }));
// });

app.use((err, req, res, next) => {
  
  logger.error(err);

  let statusCode = 500;

  let errorMessage = "Internal Server Error";
  if (err.code === 400) {
    return res.status(err.code).json(BAD_REQUEST({ message: err.message }));
  }

  if (err.code === 404) {
    // For 404 errors, render the custom 404 HTML page
    return res.status(404).render('errors/404', { layout: false });
  }

  // For other errors (500 and others), render the custom 500 HTML page
  return res.status(500).render('errors/500', { layout: false });
});


// // Custom error handling middleware
// app.use((err, req, res, next) => {
//   logger.error(err);
//   let statusCode = 500;
//   let errorMessage = "Internal Server Error";

//   if (err.code === 404) {
//     statusCode = 404;
//     errorMessage = "The requested resource could not be found.";

//     // Send the custom 404 HTML page
//     return res.status(statusCode).sendFile(path.join(__dirname, 'views', '404.ejs'));
//   }

  return res
    .status(statusCode)
    .json(INTERNAL_SERVER_ERROR({ message: errorMessage }));
});

module.exports = app;
