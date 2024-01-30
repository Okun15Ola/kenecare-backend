const router = require("express").Router();
const {
  GetAllMedicalRecordsController,
  GetMedicalRecordByIDController,
  CreateMedicalReocrdController,
  UpdateMedicalReocrdByIdController,
  DeletemedicaRecordByIdController,
} = require("../../../controllers/patients/medical-record.controller");
const { AWSUploader } = require("../../../utils/file-upload.utils");
const {
  CreateNewMedicalRecordValidation,
} = require("../../../validations/medical-records.validations");
const { param } = require("express-validator");
const { Validate } = require("../../../validations/validate");

router.get("/", GetAllMedicalRecordsController);
router.get("/:id", GetMedicalRecordByIDController);

router.post(
  "/",
  AWSUploader.single("medicalDocument"),
  CreateNewMedicalRecordValidation,
  Validate,
  CreateMedicalReocrdController
);
router.put(
  "/:id",
  AWSUploader.single("medicalDocument"),
  CreateNewMedicalRecordValidation,
  Validate,
  UpdateMedicalReocrdByIdController
);
router.delete(
  "/:id",
  [
    param("id")
      .notEmpty()
      .withMessage("Please Specify document ID to be deleted")
      .custom((id, { req }) => {
        console.log(id);
        return true;
      }),
  ],
  Validate,
  DeletemedicaRecordByIdController
);

module.exports = router;
