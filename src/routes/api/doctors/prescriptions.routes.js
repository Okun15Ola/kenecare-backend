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

router.use(authenticateUser, limiter, authorizeDoctor);

const {
  CreatePrescriptionValidation,
  UpadatePrescriptionValidation,
  GetPrescriptionsByAppointmentValidation,
  GetPrescriptionByIdValidation,
} = require("../../../validations/doctor.prescriptions.validations");

router.get(
  "/appointment/:id",
  GetPrescriptionsByAppointmentValidation,
  Validate,
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
