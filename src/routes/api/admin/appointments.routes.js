const router = require("express").Router();
const {
  GetAdminAppointmentsController,
  GetAdminAppointmentByIdController,
  GetAdminAppointmentsByDoctorIdController,
} = require("../../../controllers/admin/appointments.controller");
const { adminLimiter } = require("../../../utils/rate-limit.utils");
const { authenticateAdmin } = require("../../../middlewares/auth.middleware");
const {
  adminAppointmentPaginationValidation,
} = require("../../../validations/admin/admin-appointments.validations");
const { Validate } = require("../../../validations/validate");

router.use(authenticateAdmin, adminLimiter); // Authentication middleware & Rate limiting middleware applied to all routes in this router

router.get(
  "/",
  adminAppointmentPaginationValidation,
  Validate,
  GetAdminAppointmentsController,
);

router.get("/:id", GetAdminAppointmentByIdController);
router.get("/:id", GetAdminAppointmentByIdController);
router.get("/:id", GetAdminAppointmentByIdController);
router.get("/doctor/:id", GetAdminAppointmentsByDoctorIdController);

module.exports = router;
