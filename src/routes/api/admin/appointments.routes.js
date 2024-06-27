const router = require("express").Router();
const {
  GetAdminAppointmentsController,
  GetAdminAppointmentByIdController,
  GetAdminAppointmentsByDoctorIdController,
} = require("../../../controllers/admin/appointments.controller");
const {
  calculatePaginationInfo,
} = require("../../../middlewares/paginator.middleware");

router.get(
  "/",
  calculatePaginationInfo("medical_appointments"),
  GetAdminAppointmentsController,
);

router.get("/:id", GetAdminAppointmentByIdController);
router.get("/:id", GetAdminAppointmentByIdController);
router.get("/:id", GetAdminAppointmentByIdController);
router.get("/doctor/:id", GetAdminAppointmentsByDoctorIdController);

module.exports = router;
