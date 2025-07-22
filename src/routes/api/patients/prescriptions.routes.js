const router = require("express").Router();
const { Validate } = require("../../../validations/validate");
const {
  GetAppointmentPrescriptionController,
  GetAppointmentPrescriptionsController,
} = require("../../../controllers/patients/prescriptions.controller");
const {
  GetPrescriptionByIdValidation,
  GetPrescriptionsByAppointmentValidation,
} = require("../../../validations/patient.prescriptions.validations");
const { limiter } = require("../../../utils/rate-limit.utils");
const {
  authenticateUser,
  authorizePatient,
} = require("../../../middlewares/auth.middleware");
const {
  paginationValidation,
} = require("../../../validations/pagination.validations");

router.use(authenticateUser, limiter, authorizePatient); // Authentication middleware & Rate limiting middleware applied to all routes in this router

router.get(
  "/appointment/:id",
  [...GetPrescriptionsByAppointmentValidation, ...paginationValidation],
  Validate,
  GetAppointmentPrescriptionsController,
);
router.get(
  "/:id",
  GetPrescriptionByIdValidation,
  Validate,
  GetAppointmentPrescriptionController,
);

module.exports = router;
