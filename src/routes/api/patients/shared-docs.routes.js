const router = require("express").Router();
const {
  ShareMedicalDocumentController,
  GetAllSharedMedicalDocumentsController,
  GetSharedMedicalDocumentByIDController,
  UpdateSharedMedicalDocumentByIdController,
  DeleteSharedMedicalDocumentByIdController,
} = require("../../../controllers/patients/medical-record.controller");
const {
  ShareMedicalDocumentValidation,
  VerifyPatientSharedDocPasswordValidation,
} = require("../../../validations/medical-records.validations");
const { Validate } = require("../../../validations/validate");
const { limiter } = require("../../../utils/rate-limit.utils");
const {
  authenticateUser,
  authorizePatient,
} = require("../../../middlewares/auth.middleware");

router.use(authenticateUser, limiter, authorizePatient); // Authentication middleware & Rate limiting middleware applied to all routes in this router

router.get("/", GetAllSharedMedicalDocumentsController);

router.post(
  "/delete-shared-document",
  VerifyPatientSharedDocPasswordValidation,
  Validate,
  DeleteSharedMedicalDocumentByIdController,
);

router.post(
  "/",
  ShareMedicalDocumentValidation,
  Validate,
  ShareMedicalDocumentController,
);

router.post(
  "/verify-shared-doc-password",
  VerifyPatientSharedDocPasswordValidation,
  Validate,
  GetSharedMedicalDocumentByIDController,
);

router.put(
  "/:id",
  ShareMedicalDocumentValidation,
  Validate,
  UpdateSharedMedicalDocumentByIdController,
);

module.exports = router;
