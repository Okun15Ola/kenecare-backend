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
const {
  calculatePaginationInfo,
} = require("../../../middlewares/paginator.middleware");

router.use(authenticateUser, limiter, authorizePatient); // Authentication middleware & Rate limiting middleware applied to all routes in this router

router.get(
  "/",
  paginationValidation,
  Validate,
  calculatePaginationInfo("medical_appointments"),
  GetAppointmentsController,
);
router.get("/:id", GetAppointmentsByIDController);

router.post(
  "/",
  CreateAppointmentValidation,
  Validate,
  CreateAppointmentController,
);
// router.put("/:id", (req, res, next) => {
//   try {
//     console.log("Update patient's appointment");
//   } catch (error) {
//     console.error(error);
//   }
// });
// router.patch("/:id/date", (req, res, next) => {
//   try {
//     return res.sendStatus(200);
//   } catch (error) {
//     console.error(error);
//   }
// });
// router.patch("/:id/status", (req, res, next) => {
//   try {
//     console.log("Update patient's appointment status");
//   } catch (error) {
//     console.error(error);
//   }
// });
// router.delete("/:id", (req, res, next) => {
//   try {
//     console.log("Delete patient's appointment");
//   } catch (error) {
//     console.error(error);
//   }
// });

module.exports = router;
