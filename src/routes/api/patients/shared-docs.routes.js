const router = require("express").Router();
const { param } = require("express-validator");
const {
  ShareMedicalDocumentController,
  GetAllSharedMedicalDocumentsController,
  GetSharedMedicalDocumentByIDController,
  UpdateSharedMedicalDocumentByIdController,
  DeleteSharedMedicalDocumentByIdController,
} = require("../../../controllers/patients/medical-record.controller");
const {
  ShareMedicalDocumentValidation,
} = require("../../../validations/medical-records.validations");
const { Validate } = require("../../../validations/validate");

router.get("/", GetAllSharedMedicalDocumentsController);
router.get("/:id", GetSharedMedicalDocumentByIDController);
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
  DeleteSharedMedicalDocumentByIdController,
);

module.exports = router;
