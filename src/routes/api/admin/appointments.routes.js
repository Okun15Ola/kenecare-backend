const router = require("express").Router();
const {
  GetAdminAppointmentsController,
  GetAdminAppointmentByIdController,
  GetAdminAppointmentsByDoctorIdController,
} = require("../../../controllers/admin/appointments.controller");

router.get("/", GetAdminAppointmentsController);

router.get("/:id", GetAdminAppointmentByIdController);
router.get("/:id", GetAdminAppointmentByIdController);
router.get("/:id", GetAdminAppointmentByIdController);
router.get("/doctor/:id", GetAdminAppointmentsByDoctorIdController);

module.exports = router;
