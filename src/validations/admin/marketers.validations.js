const { body } = require("express-validator");
const {
  getMarketerByEmail,
  getMarketerByPhone,
  getMarketerByIdNumber,
  getMarketerByNin,
} = require("../../db/db.marketers");

exports.CreateMarketerValidation = [
  body("firstName")
    .notEmpty()
    .withMessage("Firstname is required")
    .bail()
    .trim()
    .escape()
    .isLength({ max: 150 })
    .withMessage("Firstname Must not Exceed 150 Character"),
  body("middleName")
    .trim()
    .escape()
    .isLength({ max: 150 })
    .withMessage("Middlename Must not Exceed 150 Character"),

  body("lastName")
    .notEmpty()
    .withMessage("Lastname is required")
    .bail()
    .trim()
    .escape()
    .isLength({ max: 150 })
    .withMessage("Lastname Must not Exceed 150 Character"),
  body("gender")
    .notEmpty()
    .withMessage("Gender is required")
    .bail()
    .trim()
    .escape()
    .toLowerCase()
    .isIn(["male", "female"])
    .withMessage("Gender must be either 'male' or 'female'"),
  body("dateOfBirth")
    .notEmpty()
    .withMessage("DOB is required")
    .bail()
    .trim()
    .escape()
    .isDate({ format: "YYYY-MM-DD" })
    .withMessage("Invalid Date Format. Expected Date Format (YYYY-MM-DD"),
  body("phoneNumber")
    .notEmpty()
    .withMessage("Phone Number is required")
    .bail()
    .matches(/^\+(232)?(\d{8})$/)
    .withMessage("Phone Number must be a registered SL (+232) number")
    .bail()
    .trim()
    .escape()
    .custom(async (phoneNumber) => {
      const data = await getMarketerByPhone(phoneNumber);
      if (data) {
        throw new Error("Phone Number Already Exists");
      }
      return true;
    })
    .bail(),

  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .bail()
    .isEmail({ ignore_max_length: false })
    .withMessage("Enter a valid email address")
    .bail()
    .isLength({ max: 150 })
    .withMessage("Email Must not Exceed 150 Character")
    .bail()
    .trim()
    .escape()
    .toLowerCase()
    .custom(async (email) => {
      const data = await getMarketerByEmail(email);
      if (data) {
        throw new Error("Emails already exists");
      }
      return true;
    })
    .bail(),
  body("homeAddress")
    .notEmpty()
    .withMessage("Home Address is required")
    .bail()
    .isLength({ max: 150 })
    .withMessage("Home Address Must not Exceed 150 Character")
    .bail()
    .trim()
    .escape(),
  body("idDocumentType")
    .notEmpty()
    .withMessage("Idenification Document Type is required")
    .bail()
    .isIn(["passport", "drivers_license", "national_id"])
    .withMessage(
      "Identification document type must be either 'passport', 'drivers_license' or 'national_id'",
    )
    .bail()
    .trim()
    .escape(),
  body("idDocumentNumber")
    .notEmpty()
    .withMessage("Idenification Document Number is required")
    .bail()
    .isLength({ max: 20 })
    .withMessage("Idenification Document Number Must not Exceed 20 Character")
    .bail()
    .trim()
    .escape()
    .custom(async (idDocumentNumber) => {
      const data = await getMarketerByIdNumber(idDocumentNumber);
      if (data) {
        throw new Error("Identification Document Number Already Exists");
      }
      return true;
    })
    .bail(),
  body("nin")
    .trim()
    .escape()
    .toUpperCase()
    .isLength({ max: 20 })
    .withMessage("NIN Must not Exceed 20 Character")
    .bail()
    .custom(async (nin) => {
      const data = await getMarketerByNin(nin);
      if (data) {
        throw new Error("NIN Already Exists");
      }
      return true;
    })
    .bail(),
  body("firstEmergencyContactName")
    .notEmpty()
    .withMessage("First Emergency Contact Name is required")
    .bail()
    .trim()
    .escape()
    .isLength({ max: 150 })
    .withMessage("First Emergency Contact Name Must not Exceed 150 Character")
    .bail(),
  body("firstEmergencyContactNumber")
    .notEmpty()
    .withMessage("First Emergency Contact Phone Number is required")
    .bail()
    .trim()
    .escape()
    .isLength({ max: 20 })
    .withMessage(
      "First Emergency Contact Phone Number Must not Exceed 20 Character",
    )
    .bail(),
  body("firstEmergencyContactAddress")
    .notEmpty()
    .withMessage("First Emergency Contact Address is required")
    .bail()
    .trim()
    .escape()
    .isLength({ max: 150 })
    .withMessage(
      "First Emergency Contact Address Must not Exceed 150 Character",
    )
    .bail(),
  body("secondEmergencyContactName")
    .notEmpty()
    .withMessage("Second Emergency Contact Name is required")
    .bail()
    .trim()
    .escape()
    .isLength({ max: 150 })
    .withMessage("Second Emergency Contact Name Must not Exceed 150 Character")
    .bail(),
  body("secondEmergencyContactNumber")
    .notEmpty()
    .withMessage("Second Emergency Contact Phone Number is required")
    .bail()
    .trim()
    .escape()
    .isLength({ max: 20 })
    .withMessage(
      "Second Emergency Contact Phone Number Must not Exceed 20 Character",
    )
    .bail(),
  body("secondEmergencyContactAddress")
    .notEmpty()
    .withMessage("Second Emergency Contact Address is required")
    .bail()
    .trim()
    .escape()
    .isLength({ max: 150 })
    .withMessage(
      "Second Emergency Contact Address Must not Exceed 150 Character",
    )
    .bail(),
];
