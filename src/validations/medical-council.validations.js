const { body, param } = require("express-validator");
const {
  getMedicalCouncilByEmail,
  getMedicalCouncilByMobileNumber,
  getMedicalCouncilById,
} = require("../repository/medical-councils.repository");

exports.CreateMedicalCouncilValidation = [
  body("name")
    .notEmpty()
    .withMessage("Medical Council Name is required")
    .bail()
    .trim()
    .escape(),
  body("email")
    .notEmpty()
    .withMessage("Medical Council Contact Email is required")
    .bail()
    .isEmail()
    .withMessage("Must be a valid email address")
    .bail()
    .trim()
    .escape()
    .toLowerCase()
    .custom(async (email) => {
      const data = await getMedicalCouncilByEmail(email);
      if (data) {
        throw new Error("That email has already been registered");
      }
      return true;
    }),
  body("mobileNumber")
    .notEmpty()
    .withMessage("Medical Council Contact Number is required")
    .bail()
    .matches(/^\+(?:[0-9]?){1,3}[0-9]{6,14}$/)
    .withMessage("Mobile Number must be in international format(e.g +XXX)")
    .bail()
    .trim()
    .escape()
    .custom(async (mobileNumber) => {
      const data = await getMedicalCouncilByMobileNumber(mobileNumber);
      if (data) {
        throw new Error("That mobile number has already been registered");
      }
      return true;
    }),
  body("address").trim().escape().toLowerCase(),
];
exports.UpdateMedicalCouncilValidation = [
  param("id")
    .notEmpty()
    .withMessage("Council ID is required")
    .bail()
    .isInt({ gt: 0 })
    .trim()
    .escape()
    .custom(async (id) => {
      const data = await getMedicalCouncilById(id);
      if (!data) {
        throw new Error("Medical Council Not Found");
      }
      return true;
    }),
  body("name")
    .notEmpty()
    .withMessage("Medical Council Name is required")
    .bail()
    .trim()
    .escape(),
  body("email")
    .notEmpty()
    .withMessage("Medical Council Contact Email is required")
    .bail()
    .isEmail()
    .withMessage("Must be a valid email address")
    .bail()
    .trim()
    .escape()
    .toLowerCase(),
  body("mobileNumber")
    .notEmpty()
    .withMessage("Medical Council Contact Number is required")
    .bail()
    .matches(/^\+(?:[0-9]?){1,3}[0-9]{6,14}$/)
    .withMessage("Mobile Number must be in international format(e.g +XXX)")
    .bail()
    .trim()
    .escape(),
  body("address").trim().escape().toLowerCase(),
];
exports.MedicalCouncilIDValidation = [
  param("id")
    .notEmpty()
    .withMessage("Council ID is required")
    .bail()
    .isInt({ gt: 0 })
    .trim()
    .escape()
    .custom(async (id) => {
      const data = await getMedicalCouncilById(id);
      if (!data) {
        throw new Error("Medical Council Not Found");
      }
      return true;
    }),
];
