require("dotenv").config();
const express = require("express");
const crypto = require("crypto");
const cors = require("cors");
const helmet = require("helmet");
const expressSession = require("express-session");
const path = require("path");
const bodyParser = require("body-parser");
const swaggerUi = require("swagger-ui-express");
const moment = require("moment");
const { sessionSecret } = require("./config/default.config");
const logUserInteraction = require("./middlewares/audit-log.middlewares.js");
const logger = require("./middlewares/logger.middleware");
const swaggerDocs = require("./utils/swagger.utils.js");
const {
  requireUserAuth,
  requireAdminAuth,
} = require("./middlewares/auth.middleware");
const {
  NOT_FOUND,
  INTERNAL_SERVER_ERROR,
  SUCCESS,
  BAD_REQUEST,
  UNAUTHORIZED,
} = require("./utils/response.utils.js");
const { zoomSecretToken } = require("./config/default.config.js");

//INDEX ROUTES
const indexRouter = require("./routes/api/index.routes");

//AUTHENTICATION ROUTER
const authRouter = require("./routes/api/auth.routes");

//DOCTORS ROUTER
const doctorsProfileRouter = require("./routes/api/doctors/profile.routes");
const doctorsSharedMedicalDocsRouter = require("./routes/api/doctors/medical-records.routes");
const doctorsAppointmentRouter = require("./routes/api/doctors/appointments.routes");
const doctorsCounculRegistrationRouter = require("./routes/api/doctors/council-registration.routes");
const doctorsWalletRouter = require("./routes/api/doctors/wallet.routes.js");
const doctorsAvailableDaysRouter = require("./routes/api/doctors/available-days.routes.js");
const doctorsPrescriptionsRouter = require("./routes/api/doctors/prescriptions.routes.js");

//PATIENTS ROUTES
const patientsProfileRouter = require("./routes/api/patients/profile.routes");
const patientAppointmentRouter = require("./routes/api/patients/appointments.routes");
const patientMedicalRecordRouter = require("./routes/api/patients/medical-records.routes");
const patientSharedMedicalDocumentRouter = require("./routes/api/patients/shared-docs.routes.js");
const patientMedicalHistoryRouter = require("./routes/api/patients/medical-history.routes");
const appointmentPaymentRoutes = require("./routes/api/patients/appointment.payments.routes");
const patientPrescriptionRoutes = require("./routes/api/patients/prescriptions.routes.js");

//ADMIN ROUTES
const adminDoctorsRoute = require("./routes/api/admin/doctors.routes");
const adminWithdrawalsRoute = require("./routes/api/admin/withdrawal-requests.routes.js");
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
const { getZoomMeetingByZoomId } = require("./db/db.zoom-meetings.js");
const {
  getAppointmentByMeetingId,
} = require("./db/db.appointments.doctors.js");

const app = express();

app.disable("x-powered-by");
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

app.use("/images", express.static(path.join(__dirname, "public/upload/media")));

app.use(
  "/docs/admin",
  requireAdminAuth,
  express.static(path.join(__dirname, "public/upload/media"))
);

app.use(
  expressSession({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true,
  })
);

app.use("/api/v1/health-check", (req, res, next) => {
  return res
    .status(200)
    .json(SUCCESS({ message: "Health Check Passed. API Working!!!" }));
});

//TODO MOVE TO A SEPERATE ROUTE FILE
app.post("/webhooks", async (req, res, next) => {
  try {
    const { body } = req;

    console.log(body);
    const message = `v0:${
      req.headers["x-zm-request-timestamp"]
    }:${JSON.stringify(req.body)}`;

    const hashForVerify = crypto
      .createHmac("sha256", zoomSecretToken)
      .update(message)
      .digest("hex");

    const signature = `v0=${hashForVerify}`;

    if (req.headers["x-zm-signature"] === signature) {
      console.log("Valid Zoom Signature");

      //check for url validation event
      if (body.event === "endpoint.url_validation") {
        const { plainToken } = body.payload;
        const hashForValidate = crypto
          .createHmac("sha256", zoomSecretToken)
          .update(req.body.payload.plainToken)
          .digest("hex");

        return res.status(200).json({
          plainToken,
          encryptedToken: hashForValidate,
        });
      }

      if (body.event === "meeting.started") {
        //meeting was started
        //TODO SEND NOTIFICATION TO PATIENT THAT THE MEETING HAS STARTED
        const { start_time, id } = body.payload.object;

        const data = await getZoomMeetingByZoomId(id);
        if (data) {
          const { meeting_id } = data;
          console.log("MEETING_ID", meeting_id);
          const appointment = await getAppointmentByMeetingId(meeting_id);
          console.log(appointment);
          if (appointment) {
            //update appointment start time
            const startTime = moment(start_time).format("HH:mm");
            console.log("Start Time", startTime);
          }
        }
      }
      if (body.event === "meeting.ended") {
        //meeting was ended
        console.log("meeting ended");
        //TODO UPDATE MEETING STATUS TO COMPLETED and remove join and start url
      }

      return res.sendStatus(200);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

app.use(logUserInteraction);
app.use("/api/v1", indexRouter);

//API DOCS ROUTE
// app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

//AUTH ROUTES
app.use("/api/v1/auth", authRouter);

//DOCTORS ROUTES
app.use("/api/v1/doctors", requireUserAuth, doctorsProfileRouter);
app.use(
  "/api/v1/doctors/prescriptions",
  requireUserAuth,
  doctorsPrescriptionsRouter
);
app.use(
  "/api/v1/doctors/shared-medical-docs",
  requireUserAuth,
  doctorsSharedMedicalDocsRouter
);
app.use("/api/v1/doctors/wallets", requireUserAuth, doctorsWalletRouter);
app.use(
  "/api/v1/doctors/available-days",
  requireUserAuth,
  doctorsAvailableDaysRouter
);
app.use(
  "/api/v1/doctors/council-registration",
  requireUserAuth,
  doctorsCounculRegistrationRouter
);
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
app.use(
  "/api/v1/patients/shared-docs",
  requireUserAuth,
  patientSharedMedicalDocumentRouter
);
app.use(
  "/api/v1/patients/medical-info",
  requireUserAuth,
  patientMedicalHistoryRouter
);
app.use(
  "/api/v1/patients/prescriptions",
  requireUserAuth,
  patientPrescriptionRoutes
);

//PAYMENT ROUTES
app.use("/api/v1/payments", appointmentPaymentRoutes);

//ADMIN ROUTES
//TODO Add a middle ware to authenticate ADMIN JWT
app.use("/api/v1/admin/auth", adminAuthRouter);
app.use("/api/v1/admin/accounts", requireAdminAuth, adminAccountsRouter);
app.use(
  "/api/v1/admin/appointments",
  requireAdminAuth,
  adminAppointmentsRouter
);
app.use(
  "/api/v1/admin/blog-categories",
  requireAdminAuth,
  adminBlogCategoriesRouter
);
app.use("/api/v1/admin/blogs", requireAdminAuth, adminBlogsRouter);
app.use("/api/v1/admin/cities", requireAdminAuth, adminCitiesRouter);
app.use("/api/v1/admin/symptoms", requireAdminAuth, adminSymptomsRouter);
app.use("/api/v1/admin/doctors", requireAdminAuth, adminDoctorsRoute);
app.use("/api/v1/admin/faqs", requireAdminAuth, adminFaqRouter);
app.use(
  "/api/v1/admin/medical-councils",
  requireAdminAuth,
  adminMedicalCouncilRouter
);
app.use("/api/v1/admin/services", requireAdminAuth, adminServicesRouter);
app.use(
  "/api/v1/admin/specializations",
  requireAdminAuth,
  adminSpecializationsRoute
);
app.use("/api/v1/admin/testimonials", requireAdminAuth, adminTestimonialsRoute);
app.use("/api/v1/admin/specialties", requireAdminAuth, adminSpecialtiesRouter);
app.use("/api/v1/admin/user-types", adminAccountsRouter);
app.use("/api/v1/admin/patients", requireAdminAuth, adminPatientsRouter);
app.use(
  "/api/v1/admin/council-regsitrations",
  requireAdminAuth,
  adminCouncilRegistrationRouter
);
app.use("/api/v1/admin/withdrawals", requireAdminAuth, adminWithdrawalsRoute);

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

  if (err.code === "LIMIT_FILE_SIZE") {
    statusCode = 400;
    errorMessage = "Select File Size too large. Max File Size: 5MB";

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
