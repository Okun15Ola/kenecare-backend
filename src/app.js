// require("newrelic");
require("dotenv").config();
require("module-alias/register");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
// const path = require("path");
const bodyParser = require("body-parser");
const swaggerUi = require("swagger-ui-express");
const swaggerDocs = require("./utils/swagger.utils");
const logUserInteraction = require("./middlewares/audit-log.middlewares");
const logger = require("./middlewares/logger.middleware");

// const { authenticateAdmin } = require("./middlewares/auth.middleware");
const {
  NOT_FOUND,
  INTERNAL_SERVER_ERROR,
  SUCCESS,
  BAD_REQUEST,
  UNAUTHORIZED,
} = require("./utils/response.utils");

// INDEX ROUTES
const indexRouter = require("./routes/api/index.routes");

// AUTHENTICATION ROUTER
const authRouter = require("./routes/api/auth.routes");

// DOCTORS ROUTER
const doctorsProfileRouter = require("./routes/api/doctors/profile.routes");
const doctorsSharedMedicalDocsRouter = require("./routes/api/doctors/medical-records.routes");
const doctorsAppointmentRouter = require("./routes/api/doctors/appointments.routes");
const doctorsCounculRegistrationRouter = require("./routes/api/doctors/council-registration.routes");
const doctorsWalletRouter = require("./routes/api/doctors/wallet.routes");
const doctorsAvailableDaysRouter = require("./routes/api/doctors/available-days.routes");
const doctorsPrescriptionsRouter = require("./routes/api/doctors/prescriptions.routes");
const doctorsFollowUpRouter = require("./routes/api/doctors/followups.routes");

// PATIENTS ROUTES
const patientsProfileRouter = require("./routes/api/patients/profile.routes");
const patientAppointmentRouter = require("./routes/api/patients/appointments.routes");
const patientMedicalRecordRouter = require("./routes/api/patients/medical-records.routes");
const patientSharedMedicalDocumentRouter = require("./routes/api/patients/shared-docs.routes");
const patientMedicalHistoryRouter = require("./routes/api/patients/medical-history.routes");
const appointmentPaymentRoutes = require("./routes/api/patients/appointment.payments.routes");
const patientPrescriptionRoutes = require("./routes/api/patients/prescriptions.routes");
const patientFollowUpRoutes = require("./routes/api/patients/follow-up.routes");

// ADMIN ROUTES
const adminDoctorsRoute = require("./routes/api/admin/doctors.routes");
const adminWithdrawalsRoute = require("./routes/api/admin/withdrawal-requests.routes");
const adminCouncilRegistrationRouter = require("./routes/api/admin/doctors.council-registration.routes");
const adminSpecializationsRoute = require("./routes/api/admin/specializations.routes");
const adminAuthRouter = require("./routes/api/admin/auth.admin.routes");
const adminAccountsRouter = require("./routes/api/admin/admin.accounts.routes");
const adminBlogCategoriesRouter = require("./routes/api/admin/blog-category.routes");
const adminBlogsRouter = require("./routes/api/admin/blogs.routes");
const adminCitiesRouter = require("./routes/api/admin/cities.routes");
const adminServicesRouter = require("./routes/api/admin/services.routes");
const adminSymptomsRouter = require("./routes/api/admin/common-symptoms.routes");
const adminSpecialtiesRouter = require("./routes/api/admin/specialties.routes");
const adminTestimonialsRoute = require("./routes/api/admin/testimonials.routes");
const adminFaqRouter = require("./routes/api/admin/faq.routes");
const adminMedicalCouncilRouter = require("./routes/api/admin/medical-council.routes");
const adminPatientsRouter = require("./routes/api/admin/patients.routes");
const adminAppointmentsRouter = require("./routes/api/admin/appointments.routes");
const adminMarketersRouter = require("./routes/api/admin/marketers.routes");

const app = express();
app.disable("x-powered-by");
app.use(cors());
app.use(
  helmet({
    hidePoweredBy: true,
    crossOriginResourcePolicy: false,
  }),
);

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(
//   "/user-profile",
//   express.static(path.join(__dirname, "public/upload/profile_pics")),
// );

// app.use("/images", express.static(path.join(__dirname, "public/upload/media")));

// app.use(
//   "/docs/admin",
//   authenticateAdmin,
//   express.static(path.join(__dirname, "public/upload/media")),
// );

app.use("/api/v1/health-check", (req, res) =>
  res
    .status(200)
    .json(
      SUCCESS({ message: "Kenecare API Health Check Passed. API Working!!!" }),
    ),
);

app.use(logUserInteraction);
app.use("/api/v1", indexRouter);

// API DOCS ROUTE
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// AUTH ROUTES
app.use("/api/v1/auth", authRouter);

// DOCTORS ROUTES
app.use("/api/v1/doctors", doctorsProfileRouter);
app.use("/api/v1/doctors/prescriptions", doctorsPrescriptionsRouter);
app.use("/api/v1/doctors/shared-medical-docs", doctorsSharedMedicalDocsRouter);
app.use("/api/v1/doctors/wallets", doctorsWalletRouter);
app.use("/api/v1/doctors/available-days", doctorsAvailableDaysRouter);
app.use(
  "/api/v1/doctors/council-registration",
  doctorsCounculRegistrationRouter,
);
app.use("/api/v1/doctors/appointments", doctorsAppointmentRouter);
app.use("/api/v1/doctors/follow-ups", doctorsFollowUpRouter);

// PATIENT'S ROUTES
app.use("/api/v1/patients", patientsProfileRouter);
app.use("/api/v1/patients/appointments", patientAppointmentRouter);
app.use("/api/v1/patients/medical-records", patientMedicalRecordRouter);
app.use("/api/v1/patients/shared-docs", patientSharedMedicalDocumentRouter);
app.use("/api/v1/patients/medical-info", patientMedicalHistoryRouter);
app.use("/api/v1/patients/prescriptions", patientPrescriptionRoutes);
app.use("/api/v1/patients/follow-ups", patientFollowUpRoutes);

// PAYMENT ROUTES
app.use("/api/v1/payments", appointmentPaymentRoutes);

// ADMIN ROUTES
app.use("/api/v1/admin/auth", adminAuthRouter);
app.use("/api/v1/admin/accounts", adminAccountsRouter);
app.use("/api/v1/admin/appointments", adminAppointmentsRouter);
app.use("/api/v1/admin/blog-categories", adminBlogCategoriesRouter);
app.use("/api/v1/admin/blogs", adminBlogsRouter);
app.use("/api/v1/admin/cities", adminCitiesRouter);
app.use("/api/v1/admin/symptoms", adminSymptomsRouter);
app.use("/api/v1/admin/doctors", adminDoctorsRoute);
app.use("/api/v1/admin/faqs", adminFaqRouter);
app.use("/api/v1/admin/medical-councils", adminMedicalCouncilRouter);
app.use("/api/v1/admin/services", adminServicesRouter);
app.use("/api/v1/admin/specializations", adminSpecializationsRoute);
app.use("/api/v1/admin/testimonials", adminTestimonialsRoute);
app.use("/api/v1/admin/specialties", adminSpecialtiesRouter);
app.use("/api/v1/admin/user-types", adminAccountsRouter);
app.use("/api/v1/admin/patients", adminPatientsRouter);
app.use("/api/v1/admin/council-regsitrations", adminCouncilRegistrationRouter);
app.use("/api/v1/admin/withdrawals", adminWithdrawalsRoute);
app.use("/api/v1/admin/marketers", adminMarketersRouter);
app.use("/api/v1/marketers", adminMarketersRouter);

// Catch-all route for handling unknown routes
app.use((req, res, next) => {
  const err = new Error("Not Found");
  err.code = 404;
  next(err);
});

app.use((err, req, res, next) => {
  console.error("An unexpected error occured: ", err);
  logger.error("An unexpected error occured: ", err);

  let statusCode = 500;
  let errorMessage = "Internal Server Error";

  if (err.response) {
    return res
      .status(err.response.status)
      .json(NOT_FOUND({ message: err.response.statusText }));
  }

  if (err.code === "FILE_TOO_LARGE") {
    statusCode = 400;
    errorMessage = "Select File Size too large. Max File Size: 10MB";

    return res.status(statusCode).json(BAD_REQUEST({ message: errorMessage }));
  }
  if (err.code === "INVALID_FILE_TYPE") {
    statusCode = 400;

    return res.status(statusCode).json(BAD_REQUEST({ message: err.message }));
  }
  if (err.statusCode === 400) {
    statusCode = 400;
    return res.status(statusCode).json(BAD_REQUEST({ message: err.message }));
  }
  if (err.statusCode === 401) {
    statusCode = 401;
    return res.status(statusCode).json(UNAUTHORIZED({ message: err.message }));
  }
  if (err.code === 404) {
    statusCode = 404;
    errorMessage = "The requested resource could not be found.";

    return res.status(statusCode).json(NOT_FOUND({ message: errorMessage }));
  }
  if (err.statusCode === 500) {
    return res
      .status(statusCode)
      .json(INTERNAL_SERVER_ERROR({ message: errorMessage }));
  }

  return next();
});

module.exports = app;
