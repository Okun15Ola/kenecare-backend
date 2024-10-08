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

module.exports = router;
