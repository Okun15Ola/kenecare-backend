const router = require("express").Router();
const {
  GetAllMedicalRecordsController,
  GetMedicalRecordByIDController,
  CreateMedicalRecordController,
  UpdateMedicalRecordByIdController,
  DeleteMedicalRecordByIdController,
} = require("../../../controllers/patients/medical-record.controller");
const { AWSUploader } = require("../../../utils/file-upload.utils");
const {
  CreateNewMedicalRecordValidation,
  VerifyPatientMedicalDocumentPasswordValidation,
} = require("../../../validations/medical-records.validations");
const { Validate } = require("../../../validations/validate");
const { limiter } = require("../../../utils/rate-limit.utils");
const {
  authenticateUser,
  authorizePatient,
} = require("../../../middlewares/auth.middleware");
const {
  paginationValidation,
} = require("../../../validations/pagination.validations");

router.use(authenticateUser, limiter, authorizePatient);

router.get("/", paginationValidation, Validate, GetAllMedicalRecordsController);

router.post(
  "/verify-medical-document",
  VerifyPatientMedicalDocumentPasswordValidation,
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

router.post(
  "/delete-medical-document",
  VerifyPatientMedicalDocumentPasswordValidation,
  Validate,
  DeleteMedicalRecordByIdController,
);

router.put(
  "/:id",
  AWSUploader.single("medicalDocument"),
  CreateNewMedicalRecordValidation,
  Validate,
  UpdateMedicalRecordByIdController,
);

module.exports = router;
