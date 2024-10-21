require("dotenv").config();
const express = require("express");
const crypto = require("crypto");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const bodyParser = require("body-parser");
const moment = require("moment");
const swaggerUi = require("swagger-ui-express");
const swaggerDocs = require("./utils/swagger.utils");
const logUserInteraction = require("./middlewares/audit-log.middlewares");
const logger = require("./middlewares/logger.middleware");
const { runCron } = require("./utils/cron.utils");
const {
  requireUserAuth,
  requireAdminAuth,
  requireDoctorAuth,
} = require("./middlewares/auth.middleware");
const {
  NOT_FOUND,
  INTERNAL_SERVER_ERROR,
  SUCCESS,
  BAD_REQUEST,
} = require("./utils/response.utils");
const { zoomSecretToken } = require("./config/default.config");

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
const { getZoomMeetingByZoomId } = require("./db/db.zoom-meetings");
const {
  getAppointmentByMeetingId,
  updateDoctorAppointmentStartTime,
  updateDoctorAppointmentEndTime,
} = require("./db/db.appointments.doctors");

const app = express();
runCron();
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
app.use(
  "/user-profile",
  express.static(path.join(__dirname, "public/upload/profile_pics")),
);

app.use("/images", express.static(path.join(__dirname, "public/upload/media")));

app.use(
  "/docs/admin",
  requireAdminAuth,
  express.static(path.join(__dirname, "public/upload/media")),
);

app.use("/api/v1/health-check", (req, res) =>
  res
    .status(200)
    .json(SUCCESS({ message: "Health Check Passed. API Working!!!" })),
);

//  TODO MOVE TO A SEPERATE ROUTE FILE
app.post("/zoom-hook", async (req, res) => {
  try {
    const { body } = req;
    const { event } = body;

    const message = `v0:${
      req.headers["x-zm-request-timestamp"]
    }:${JSON.stringify(req.body)}`;

    const hashForVerify = crypto
      .createHmac("sha256", zoomSecretToken)
      .update(message)
      .digest("hex");

    const signature = `v0=${hashForVerify}`;

    if (req.headers["x-zm-signature"] === signature) {
      // check for url validation event
      if (event === "endpoint.url_validation") {
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

      if (event === "meeting.started") {
        // meeting was started
        // TODO SEND NOTIFICATION TO PATIENT THAT THE MEETING HAS STARTED
        const { start_time: startTime, id } = body.payload.object;

        const data = await getZoomMeetingByZoomId(id);
        if (data) {
          const { meeting_id: meetingId } = data;
          const appointment = await getAppointmentByMeetingId(meetingId);
          if (appointment) {
            const { appointment_id: appointmentId } = appointment;
            // update appointment start time
            const done = await updateDoctorAppointmentStartTime({
              appointmentId,
              startTime: moment(startTime).format("HH:mm"),
            });

            console.log(done);
          }
        }
      }
      if (body.event === "meeting.ended") {
        // meeting was ended
        // TODO SEND NOTIFICATION TO PATIENT THAT THE MEETING HAS ENDED
        const { end_time: endTime, id } = body.payload.object;

        const data = await getZoomMeetingByZoomId(id);
        if (data) {
          const { meeting_id: meetingId } = data;
          const appointment = await getAppointmentByMeetingId(meetingId);
          if (appointment) {
            const { appointment_id: appointmentId } = appointment;

            // update appointment end time
            const done = await updateDoctorAppointmentEndTime({
              appointmentId,
              endTime: moment(endTime).format("HH:mm"),
            });
            console.log(done);
          }
        }
      }

      return res.sendStatus(200);
    }
    return null;
  } catch (error) {
    console.log(error);
    return error;
  }
});

app.use(logUserInteraction);
app.use("/api/v1", indexRouter);

// API DOCS ROUTE
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// AUTH ROUTES
app.use("/api/v1/auth", authRouter);

// DOCTORS ROUTES
app.use("/api/v1/doctors", requireUserAuth, doctorsProfileRouter);
app.use(
  "/api/v1/doctors/prescriptions",
  requireUserAuth,
  doctorsPrescriptionsRouter,
);
app.use(
  "/api/v1/doctors/shared-medical-docs",
  requireUserAuth,
  doctorsSharedMedicalDocsRouter,
);
app.use("/api/v1/doctors/wallets", requireUserAuth, doctorsWalletRouter);
app.use(
  "/api/v1/doctors/available-days",
  requireUserAuth,
  doctorsAvailableDaysRouter,
);
app.use(
  "/api/v1/doctors/council-registration",
  requireUserAuth,
  doctorsCounculRegistrationRouter,
);
app.use(
  "/api/v1/doctors/appointments",
  requireUserAuth,
  requireDoctorAuth,
  doctorsAppointmentRouter,
);
app.use(
  "/api/v1/doctors/follow-ups",
  requireUserAuth,
  requireDoctorAuth,
  doctorsFollowUpRouter,
);

// PATIENT'S ROUTES
app.use("/api/v1/patients", requireUserAuth, patientsProfileRouter);
app.use(
  "/api/v1/patients/appointments",
  requireUserAuth,
  patientAppointmentRouter,
);
app.use(
  "/api/v1/patients/medical-records",
  requireUserAuth,
  patientMedicalRecordRouter,
);
app.use(
  "/api/v1/patients/shared-docs",
  requireUserAuth,
  patientSharedMedicalDocumentRouter,
);
app.use(
  "/api/v1/patients/medical-info",
  requireUserAuth,
  patientMedicalHistoryRouter,
);
app.use(
  "/api/v1/patients/prescriptions",
  requireUserAuth,
  patientPrescriptionRoutes,
);

// PAYMENT ROUTES
app.use("/api/v1/payments", appointmentPaymentRoutes);

// ADMIN ROUTES
// TODO Add a middle ware to authenticate ADMIN JWT
app.use("/api/v1/admin/auth", adminAuthRouter);
app.use("/api/v1/admin/accounts", requireAdminAuth, adminAccountsRouter);
app.use(
  "/api/v1/admin/appointments",
  requireAdminAuth,
  adminAppointmentsRouter,
);
app.use(
  "/api/v1/admin/blog-categories",
  requireAdminAuth,
  adminBlogCategoriesRouter,
);
app.use("/api/v1/admin/blogs", requireAdminAuth, adminBlogsRouter);
app.use("/api/v1/admin/cities", requireAdminAuth, adminCitiesRouter);
app.use("/api/v1/admin/symptoms", requireAdminAuth, adminSymptomsRouter);
app.use("/api/v1/admin/doctors", requireAdminAuth, adminDoctorsRoute);
app.use("/api/v1/admin/faqs", requireAdminAuth, adminFaqRouter);
app.use(
  "/api/v1/admin/medical-councils",
  requireAdminAuth,
  adminMedicalCouncilRouter,
);
app.use("/api/v1/admin/services", requireAdminAuth, adminServicesRouter);
app.use(
  "/api/v1/admin/specializations",
  requireAdminAuth,
  adminSpecializationsRoute,
);
app.use("/api/v1/admin/testimonials", requireAdminAuth, adminTestimonialsRoute);
app.use("/api/v1/admin/specialties", requireAdminAuth, adminSpecialtiesRouter);
app.use("/api/v1/admin/user-types", adminAccountsRouter);
app.use("/api/v1/admin/patients", requireAdminAuth, adminPatientsRouter);
app.use(
  "/api/v1/admin/council-regsitrations",
  requireAdminAuth,
  adminCouncilRegistrationRouter,
);
app.use("/api/v1/admin/withdrawals", requireAdminAuth, adminWithdrawalsRoute);

// Catch-all route for handling unknown routes
app.use((req, res, next) => {
  const err = new Error("Not Found");
  err.code = 404;
  next(err);
});

app.use((err, req, res, next) => {
  // console.log("AN ERROR: ", err);
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
