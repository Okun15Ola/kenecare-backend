const router = require("express").Router();
const {
  GetAppointmentsController,
  GetAppointmentsByIDController,
  CreateAppointmentController,
} = require("../../../controllers/patients/appointments.controller");
const {
  CreateAppointmentValidation,
} = require("../../../validations/appointments.validations");
const { Validate } = require("../../../validations/validate");
const { limiter } = require("../../../utils/rate-limit.utils");
const {
  authenticateUser,
  authorizePatient,
} = require("../../../middlewares/auth.middleware");
const {
  paginationValidation,
} = require("../../../validations/pagination.validations");

router.use(authenticateUser, limiter, authorizePatient); // Authentication middleware & Rate limiting middleware applied to all routes in this router

router.get("/", paginationValidation, Validate, GetAppointmentsController);
router.get("/:id", GetAppointmentsByIDController);

router.post(
  "/",
  CreateAppointmentValidation,
  Validate,
  CreateAppointmentController,
);

module.exports = router;
