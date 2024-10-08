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
} = require("../../../controllers/doctors/appointments.controller");

const {
  StartAppointmentValidation,
  ApproveAppointmentValidation,
  PostponeAppointmentValidation,
} = require("../../../validations/appointments.validations");

router.get("/", GetDoctorAppointmentsController);
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
