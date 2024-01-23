const router = require("express").Router();
const {
  GetDoctorAppointmentsController,
  GetDoctorAppointmentsByIDController,
  CancelDoctorAppointmentController,
  ApproveDoctorAppointmentController,
  PostponeDoctorAppointmentController,
  StartDoctorAppointmentController,
} = require("../../../controllers/doctors/appointments.controller");

router.get("/", GetDoctorAppointmentsController);
router.get("/:id", GetDoctorAppointmentsByIDController);

//TODO add data validation rules
router.patch("/:id/approve", ApproveDoctorAppointmentController);
router.patch("/:id/cancel", CancelDoctorAppointmentController);
router.patch("/:id/postpone", PostponeDoctorAppointmentController);
router.patch("/:id/start", StartDoctorAppointmentController);

module.exports = router;
