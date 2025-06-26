const router = require("express").Router();
const {
  GetAllMedicalRecordsController,
  GetMedicalRecordByIDController,
  CreateMedicalRecordController,
  UpdateMedicalRecordByIdController,
  DeletemedicaRecordByIdController,
} = require("../../../controllers/patients/medical-record.controller");
const { AWSUploader } = require("../../../utils/file-upload.utils");
const {
  CreateNewMedicalRecordValidation,
  MedicalRecordIdValidation,
} = require("../../../validations/medical-records.validations");
const { Validate } = require("../../../validations/validate");

router.get("/", GetAllMedicalRecordsController);
router.get(
  "/:id",
  MedicalRecordIdValidation,
  Validate,
  GetMedicalRecordByIDController,
);

router.post(
  "/",
  AWSUploader.single("medicalDocument"),
  CreateNewMedicalRecordValidation,
  Validate,
  CreateMedicalRecordController,
);

router.put(
  "/:id",
  AWSUploader.single("medicalDocument"),
  CreateNewMedicalRecordValidation,
  Validate,
  UpdateMedicalRecordByIdController,
);
router.delete(
  "/:id",
  MedicalRecordIdValidation,
  Validate,
  DeletemedicaRecordByIdController,
);

module.exports = router;
