const router = require("express").Router();
const { Validate } = require("../../../validations/validate");
const {
  GetDoctorAppointmentsController,
  GetDoctorAppointmentsByIDController,
  CancelDoctorAppointmentController,
  ApproveDoctorAppointmentController,
  PostponeDoctorAppointmentController,
  StartDoctorAppointmentController,
  EndDoctorAppointmentController,
  GetDoctorAppointmentMetricsController,
} = require("../../../controllers/doctors/appointments.controller");
const {
  StartAppointmentValidation,
  ApproveAppointmentValidation,
  PostponeAppointmentValidation,
} = require("../../../validations/appointments.validations");
const { limiter } = require("../../../utils/rate-limit.utils");
const {
  authenticateUser,
  authorizeDoctor,
} = require("../../../middlewares/auth.middleware");
const {
  paginationValidation,
} = require("../../../validations/pagination.validations");

router.use(authenticateUser, limiter, authorizeDoctor); // Authentication middleware & Rate limiting middleware applied to all routes in this router

router.get("/metrics", GetDoctorAppointmentMetricsController);
router.get(
  "/",
  paginationValidation,
  Validate,
  GetDoctorAppointmentsController,
);
router.get("/:id", GetDoctorAppointmentsByIDController);

router.patch(
  "/:id/approve",
  ApproveAppointmentValidation,
  Validate,
  ApproveDoctorAppointmentController,
);
router.patch("/:id/cancel", CancelDoctorAppointmentController);
router.patch(
  "/:id/postpone",
  PostponeAppointmentValidation,
  Validate,
  PostponeDoctorAppointmentController,
);
router.patch(
  "/:id/start",
  StartAppointmentValidation,
  Validate,
  StartDoctorAppointmentController,
);
router.patch("/:id/end", EndDoctorAppointmentController);

module.exports = router;
