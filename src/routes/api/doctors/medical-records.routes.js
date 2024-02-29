const router = require("express").Router();
const {
  GetAllSharedMedicalRecordsController,
  GetSharedMedicalRecordByIDController,
} = require("../../../controllers/doctors/medical-record.controller");

const { param } = require("express-validator");
const { Validate } = require("../../../validations/validate");

router.get("/", GetAllSharedMedicalRecordsController);
router.get("/:id", GetSharedMedicalRecordByIDController);

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
