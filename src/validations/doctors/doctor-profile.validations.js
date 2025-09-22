const { body } = require("express-validator");
const {
  getSpecialtiyById,
} = require("../../repository/specialities.repository");
const { getCityById } = require("../../repository/cities.repository");

exports.createDoctorProfileValidations = [
  body("title").notEmpty().withMessage("Title is required").trim().escape(),
  body("firstname")
    .notEmpty()
    .withMessage("First Name is required")
    .bail()
    .isLength({ min: 1, max: 50 })
    .withMessage("First Name Must not be longer than 50 character")
    .bail()
    .trim()
    .escape(),
  body("middlename").trim().escape(),
  body("lastname")
    .notEmpty()
    .withMessage("Last Name is required")
    .bail()
    .isLength({ min: 1, max: 50 })
    .withMessage("Last Name Must not be longer than 50 character")
    .bail()
    .trim()
    .escape(),
  body("gender")
    .notEmpty()
    .withMessage("Gender is required")
    .bail()
    .trim()
    .escape()
    .toLowerCase(),
  body("specialization")
    .notEmpty()
    .withMessage("Specialization is required")
    .bail()
    .isNumeric({ no_symbols: true })
    .isInt({ allow_leading_zeroes: false, gt: 0 })
    .withMessage("Invalid Specialization")
    .bail()
    .trim()
    .escape()
    .custom(async (id) => {
      const data = await getSpecialtiyById(id); // changed from getSpecializationById
      if (!data) {
        throw new Error("Specified Specialization Does not exist");
      }
    }),
  body("qualifications")
    .notEmpty()
    .withMessage("Qualifications is required")
    .bail()
    .trim()
    .escape(),
  body("consultationfee")
    .notEmpty()
    .withMessage("Consultation Fee is required")
    .bail()
    .isNumeric({ no_symbols: true })
    .withMessage("Consultation Fee must be a valid amount")
    .bail()
    .isFloat({ min: 0, max: 100000 }) // Assuming a reasonable upper limit
    .withMessage("Consultation Fee must be a positive amount")
    .bail()
    .trim()
    .escape(),
  body("city")
    .notEmpty()
    .withMessage("City is required")
    .bail()
    .isNumeric({ no_symbols: true })
    .isInt({ allow_leading_zeroes: false, gt: 0 })
    .withMessage("Invalid City")
    .bail()
    .trim()
    .escape()
    .custom(async (id) => {
      const data = await getCityById(id);
      if (!data) {
        throw new Error("Specified City Does not exist");
      }
    }),
  body("yearOfExperience")
    .notEmpty()
    .withMessage("Year(s) of Experience is required")
    .bail()
    .isNumeric({ no_symbols: true })
    .isInt({ allow_leading_zeroes: false, gt: 0, lt: 100 })
    .withMessage("Year(s) of experience must be a positive integer")
    .bail()
    .trim()
    .escape(),
  body("profileSummary").trim().escape(),
];
