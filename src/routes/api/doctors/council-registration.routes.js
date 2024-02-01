const router = require("express").Router();
const { body } = require("express-validator");
const { Validate } = require("../../../validations/validate");
const {
  GetDoctorCouncilRegistrationController,
  CreateDoctorCouncilRegistration,
} = require("../../../controllers/doctors/profile.controller");

const { localMediaUploader } = require("../../../utils/file-upload.utils");
const { getMedicalCouncilById } = require("../../../db/db.medical-councils");

router.post(
  "/council-registration",
  localMediaUploader.single("regCertificate"),
  [
    body("councilId")
      .notEmpty()
      .withMessage("Please specify medical council ID")
      .trim()
      .escape()
      .custom(async (id, { req }) => {
        const data = await getMedicalCouncilById(id);
        if (!data) {
          throw new Error("Medical Council Not Found.");
        }
        return true;
      }),
    body("regNumber")
      .notEmpty()
      .withMessage("Registration Number is requred")
      .trim()
      .escape()
      .toUpperCase(),
    body("certIssuedDate")
      .notEmpty()
      .withMessage("Please specify medical council ID")
      .trim()
      .escape(),
    body("certExpiryDate")
      .notEmpty()
      .withMessage("Please specify medical council ID")
      .trim()
      .escape(),
  ],
  Validate,
  CreateDoctorCouncilRegistration
);
router.get("/council-registration", GetDoctorCouncilRegistrationController);
module.exports = router;
