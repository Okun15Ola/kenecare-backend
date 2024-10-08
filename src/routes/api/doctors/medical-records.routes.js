const router = require("express").Router();
const { Validate } = require("../../../validations/validate");
const {
  GetAllSharedMedicalRecordsController,
  GetSharedMedicalRecordByIDController,
} = require("../../../controllers/doctors/medical-record.controller");
const {
  GetDoctorSharedMedicalDocumentValidation,
} = require("../../../validations/medical-records.validations");

router.get("/", GetAllSharedMedicalRecordsController);
router.get(
  "/:id",
  GetDoctorSharedMedicalDocumentValidation,
  Validate,
  GetSharedMedicalRecordByIDController,
);

module.exports = router;
