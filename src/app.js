require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const expressSession = require("express-session");
const path = require("path");
const bodyParser = require("body-parser");
const { sessionSecret } = require("./config/default.config");
const logUserInteraction = require("./middlewares/audit-log.middlewares.js");
const logger = require("./middlewares/logger.middleware");
const {
  requireUserAuth,
  requireAdminAuth,
} = require("./middlewares/auth.middleware");
const {
  NOT_FOUND,
  INTERNAL_SERVER_ERROR,
  SUCCESS,
  BAD_REQUEST,
} = require("./utils/response.utils.js");

//API ROUTES

//INDEX ROUTES
const indexRouter = require("./routes/api/index.routes.js");

//AUTHENTICATION ROUTER
const authRouter = require("./routes/api/auth.routes");

//DOCTORS ROUTER
const doctorsProfileRouter = require("./routes/api/doctors/profile.routes");
const doctorsAppointmentRouter = require("./routes/api/doctors/appointments.routes.js");

//PATIENTS ROUTES
const patientsProfileRouter = require("./routes/api/patients/profile.routes");
const patientAppointmentRouter = require("./routes/api/patients/appointments.routes.js");
const patientMedicalRecordRouter = require("./routes/api/patients/medical-records.routes.js");
const appointmentPaymentRoutes = require("./routes/api/patients/appointment.payments.routes.js");

//ADMIN ROUTES
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
const swaggerUi = require("swagger-ui-express");

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
app.use(
  "/user-profile",
  express.static(path.join(__dirname, "public/upload/profile_pics"))
);
app.use(express.static(__dirname + "/public/upload/media"));
app.use(
  expressSession({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true,
  })
);

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

app.use("/api/v1/health-check", (req, res, next) => {
  return res
    .status(200)
    .json(SUCCESS({ message: "Health Check Passed. API Working!!!" }));
});
app.use(logUserInteraction);
app.use("/api/v1", indexRouter);

//API DOCS ROUTE
const swaggerDocs = require("./utils/swagger.utils.js");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

//AUTH ROUTES
app.use("/api/v1/auth", authRouter);

//DOCTORS ROUTES
app.use("/api/v1/doctors", requireUserAuth, doctorsProfileRouter);
app.use(
  "/api/v1/doctors/appointments",
  requireUserAuth,
  doctorsAppointmentRouter
);

//PATIENT'S ROUTES
app.use("/api/v1/patients", requireUserAuth, patientsProfileRouter);
app.use(
  "/api/v1/patients/appointments",
  requireUserAuth,
  patientAppointmentRouter
);
app.use(
  "/api/v1/patients/medical-records",
  requireUserAuth,
  patientMedicalRecordRouter
);

//PAYMENT ROUTES
app.use("/api/v1/payments", requireUserAuth, appointmentPaymentRoutes);

//ADMIN ROUTES
//TODO Add a middle ware to authenticate ADMIN JWT
app.use("/api/v1/admin/auth", adminAuthRouter);
app.use("/api/v1/admin/accounts", adminAccountsRouter);
app.use("/api/v1/admin/appointments", adminAccountsRouter);
app.use("/api/v1/admin/blog-categories", adminBlogCategoriesRouter);
app.use("/api/v1/admin/blogs", requireAdminAuth, adminBlogsRouter);
app.use("/api/v1/admin/cities", requireAdminAuth, adminCitiesRouter);
app.use("/api/v1/admin/symptoms", requireAdminAuth, adminSymptomsRouter);
app.use("/api/v1/admin/doctors", adminDoctorsRoute);
app.use("/api/v1/admin/faqs", requireAdminAuth, adminFaqRouter);
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
