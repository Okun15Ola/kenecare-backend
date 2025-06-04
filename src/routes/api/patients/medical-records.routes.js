const router = require("express").Router();
const { param } = require("express-validator");
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
} = require("../../../validations/medical-records.validations");
const { Validate } = require("../../../validations/validate");
const {
  getPatientMedicalDocumentByDocumentId,
} = require("../../../repository/patient-docs.repository");
const {
  getPatientByUserId,
} = require("../../../repository/patients.repository");

router.get("/", GetAllMedicalRecordsController);
router.get(
  "/:id",
  [
    param("id")
      .notEmpty()
      .withMessage("Document Id is required")
      .bail()
      .trim()
      .escape()
      .custom(async (value, { req }) => {
        const { patient_id: patientId } = await getPatientByUserId(req.user.id);
        if (!patientId) {
          throw new Error("Error fetching document");
        }
        const documentId = parseInt(value, 10);
        const data = await getPatientMedicalDocumentByDocumentId({
          documentId,
          patientId,
        });
        if (!data) {
          throw new Error("Specified Document Not Found");
        }
        return true;
      }),
  ],
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
  [
    param("id")
      .notEmpty()
      .withMessage("Please Specify document ID to be deleted")
      .custom((id) => {
        console.log(id);
        return true;
      }),
  ],
  Validate,
  DeletemedicaRecordByIdController,
);

module.exports = router;
