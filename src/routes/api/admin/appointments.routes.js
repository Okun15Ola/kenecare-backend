const router = require("express").Router();
const {
  GetAdminAppointmentsController,
  GetAdminAppointmentByIdController,
} = require("../../../controllers/admin/appointments.controller");

router.get("/", GetAdminAppointmentsController);

router.get("/:id", GetAdminAppointmentByIdController);

module.exports = router;
