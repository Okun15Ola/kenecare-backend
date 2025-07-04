const router = require("express").Router();
const {
  GetAppointmentPrescriptionController,
  GetAppointmentPrescriptionsController,
  CreatePrescriptionController,
  UpdatePrescriptionController,
} = require("../../../controllers/doctors/prescriptions.controller");
const { Validate } = require("../../../validations/validate");
const { limiter } = require("../../../utils/rate-limit.utils");
const {
  authenticateUser,
  authorizeDoctor,
} = require("../../../middlewares/auth.middleware");

router.use(authenticateUser, limiter, authorizeDoctor); // Authentication middleware, Rate limiting & Authorization middleware applied to all routes in this router

const {
  CreatePrescriptionValidation,
  UpadatePrescriptionValidation,
  GetPrescriptionsByAppointmentValidation,
  GetPrescriptionByIdValidation,
} = require("../../../validations/doctor.prescriptions.validations");
const {
  paginationValidation,
} = require("../../../validations/pagination.validations");
const {
  calculatePaginationInfo,
} = require("../../../middlewares/paginator.middleware");

router.get(
  "/appointment/:id",
  [...GetPrescriptionsByAppointmentValidation, ...paginationValidation],
  Validate,
  calculatePaginationInfo("appointment_prescriptions"),
  GetAppointmentPrescriptionsController,
);
router.get(
  "/:id",
  GetPrescriptionByIdValidation,
  Validate,
  GetAppointmentPrescriptionController,
);
router.post(
  "/",
  CreatePrescriptionValidation,
  Validate,
  CreatePrescriptionController,
);

router.put(
  "/:id",
  UpadatePrescriptionValidation,
  Validate,
  UpdatePrescriptionController,
);

module.exports = router;
