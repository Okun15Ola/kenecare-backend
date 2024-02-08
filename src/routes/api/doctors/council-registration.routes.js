const router = require("express").Router();
const moment = require("moment");
const { body, param } = require("express-validator");
const { Validate } = require("../../../validations/validate");
const {
  GetDoctorCouncilRegistrationController,
  GetDoctorCouncilRegistrationDocumentController,
  CreateDoctorCouncilRegistration,
  UpdateCouncilRegistrationController,
} = require("../../../controllers/doctors/council-registration.controller");

const { localMediaUploader } = require("../../../utils/file-upload.utils");
const { getMedicalCouncilById } = require("../../../db/db.medical-councils");
const {
  getCouncilRegistrationById,
  getCouncilRegistrationByRegNumber,
} = require("../../../db/db.doctors");

router.post(
  "/",
  localMediaUploader.single("regCertificate"),
  [
    body("councilId")
      .notEmpty()
      .withMessage("Medical Council Is Required")
      .trim()
      .escape()
      .custom(async (id, { req }) => {
        const data = await getMedicalCouncilById(id);
        if (!data) {
          throw new Error("Medical Council Not Found.");
        }
        return true;
      }),
    body("regYear")
      .notEmpty()
      .withMessage("Registration Year Is Required")
      .trim()
      .escape()
      .toUpperCase()
      .custom((value, { req }) => {
        if (!moment(value).year()) {
          throw new Error("Please specify a valid registration year");
        }

        if (moment(value).isAfter(moment())) {
          throw new Error("Registration Year cannot be after than this year");
        }
        return true;
      }),
    body("regNumber")
      .notEmpty()
      .withMessage("Registration Number is requred")
      .trim()
      .escape()
      .toUpperCase()
      .custom(async (regNumber, { req }) => {
        const data = await getCouncilRegistrationByRegNumber(regNumber);
        console.log(data);
        if (data) {
          throw new Error(
            `Medical Council Registration Number ${regNumber} already exists. Please try a different registration number`
          );
        }
        return true;
      }),
    body("certIssuedDate")
      .notEmpty()
      .withMessage("Please specify certificate issued date")
      .trim()
      .escape()
      .custom((value, { req }) => {
        if (moment(value).isAfter(moment())) {
          throw new Error(
            "Certificate Issued Date cannot be earlier than today's date"
          );
        }

        if (moment(value).isSameOrAfter(moment(req.body.certExpiryDate))) {
          throw new Error(
            "Certificate Issued Date cannot be earlier/same as expiry date "
          );
        }

        return true;
      }),
    body("certExpiryDate")
      .notEmpty()
      .withMessage("Please specify certificate expiry date")
      .trim()
      .escape()
      .custom((value, { req }) => {
        if (
          moment(value, "YYYY-MM-DD").isBefore(moment().format("YYYY-MM-DD"))
        ) {
          throw new Error(
            "Certificate Expiry Date cannot be before today's date"
          );
        }

        return true;
      }),
  ],
  Validate,
  CreateDoctorCouncilRegistration
);
router.get("/", GetDoctorCouncilRegistrationController);
router.get("/doc/:filename", GetDoctorCouncilRegistrationDocumentController);
router.put(
  "/:id",
  localMediaUploader.single("regCertificate"),
  [
    param("id")
      .notEmpty()
      .withMessage("Registration ID is required")
      .isNumeric({ no_symbols: true })
      .custom(async (id, { req }) => {
        const data = await getCouncilRegistrationById(id);

        if (!data) {
          throw new Error("Medical Council Registration Not Found");
        }
        return true;
      }),
  ],
  Validate,
  UpdateCouncilRegistrationController
);
module.exports = router;
