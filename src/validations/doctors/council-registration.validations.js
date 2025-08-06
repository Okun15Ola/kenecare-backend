const moment = require("moment");
const { body } = require("express-validator");
const {
  getMedicalCouncilById,
} = require("../../repository/medical-councils.repository");
const {
  getCouncilRegistrationByRegNumber,
} = require("../../repository/doctors.repository");

exports.councilValidations = [
  body("councilId")
    .notEmpty()
    .withMessage("Medical Council Is Required")
    .bail()
    .custom((value) => {
      if (moment(value).isAfter(moment())) {
        throw new Error(
          "Certificate Issued Date cannot be later than today's date",
        );
      }
      return true;
    })
    .isInt({ gt: 0 })
    .trim()
    .escape()
    .custom(async (id) => {
      const data = await getMedicalCouncilById(id);
      if (!data) {
        throw new Error("Medical Council Not Found.");
      }
      return true;
    }),
  body("regYear")
    .notEmpty()
    .withMessage("Registration Year Is Required")
    .bail()
    .trim()
    .escape()
    .custom((value) => {
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
    .bail()
    .trim()
    .escape()
    .custom(async (regNumber) => {
      const data = await getCouncilRegistrationByRegNumber(regNumber);
      if (data) {
        throw new Error(
          `Medical Council Registration Number ${regNumber} already exists. Please try a different registration number`,
        );
      }
      return true;
    }),
  body("certIssuedDate")
    .notEmpty()
    .withMessage("Please specify certificate issued date")
    .bail()
    .trim()
    .escape()
    .custom((value, { req }) => {
      if (moment(value).isAfter(moment())) {
        throw new Error(
          "Certificate Issued Date cannot be earlier than today's date",
        );
      }

      if (moment(value).isSameOrAfter(moment(req.body.certExpiryDate))) {
        throw new Error(
          "Certificate Issued Date cannot be earlier/same as expiry date ",
        );
      }

      return true;
    }),
  body("certExpiryDate")
    .notEmpty()
    .withMessage("Please specify certificate expiry date")
    .bail()
    .trim()
    .escape()
    .custom((value) => {
      if (moment(value, "YYYY-MM-DD").isBefore(moment().format("YYYY-MM-DD"))) {
        throw new Error(
          "Certificate Expiry Date cannot be before today's date",
        );
      }

      return true;
    }),
];
