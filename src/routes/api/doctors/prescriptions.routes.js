const router = require("express").Router();
const {
  GetAppointmentPrescriptionController,
  GetAppointmentPrescriptionsController,
  CreatePrescriptionController,
  UpdatePrescriptionController,
} = require("../../../controllers/doctors/prescriptions.controller");

const { Validate } = require("../../../validations/validate");

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
