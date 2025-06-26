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
  GetDoctorSharedMedicalDocumentValidation,
} = require("../../../validations/medical-records.validations");
const { Validate } = require("../../../validations/validate");

router.get("/", GetAllSharedMedicalDocumentsController);
router.get(
  "/:id",
  GetDoctorSharedMedicalDocumentValidation,
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
  GetDoctorSharedMedicalDocumentValidation,
  Validate,
  DeleteSharedMedicalDocumentByIdController,
);

module.exports = router;
