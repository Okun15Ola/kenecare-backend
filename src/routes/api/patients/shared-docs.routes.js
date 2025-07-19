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
  GetPatientSharedMedicalDocumentValidation,
} = require("../../../validations/medical-records.validations");
const { Validate } = require("../../../validations/validate");
const { limiter } = require("../../../utils/rate-limit.utils");
const {
  authenticateUser,
  authorizePatient,
} = require("../../../middlewares/auth.middleware");

router.use(authenticateUser, limiter, authorizePatient); // Authentication middleware & Rate limiting middleware applied to all routes in this router

router.get("/", GetAllSharedMedicalDocumentsController);

router.get(
  "/:id",
  GetPatientSharedMedicalDocumentValidation,
  Validate,
  GetSharedMedicalDocumentByIDController,
);

router.post(
  "/",
  ShareMedicalDocumentValidation,
  Validate,
  ShareMedicalDocumentController,
);
router.put(
  "/:id",
  ShareMedicalDocumentValidation,
  Validate,
  UpdateSharedMedicalDocumentByIdController,
);
router.delete(
  "/:id",
  GetPatientSharedMedicalDocumentValidation,
  Validate,
  DeleteSharedMedicalDocumentByIdController,
);

module.exports = router;
