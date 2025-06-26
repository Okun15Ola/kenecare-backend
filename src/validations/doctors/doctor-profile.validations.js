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
    .isLength({ min: 1, max: 50 })
    .withMessage("First Name Must not be longer than 50 character")
    .trim()
    .escape(),
  body("middlename").trim().escape(),
  body("lastname")
    .notEmpty()
    .withMessage("Last Name is required")
    .isLength({ min: 1, max: 50 })
    .withMessage("Last Name Must not be longer than 50 character")
    .trim()
    .escape(),
  body("gender")
    .notEmpty()
    .withMessage("Gender is required")
    .trim()
    .escape()
    .toLowerCase(),
  body("specialization")
    .notEmpty()
    .withMessage("Specialization is required")
    .isNumeric({ no_symbols: true })
    .isInt({ allow_leading_zeroes: false, gt: 0 })
    .withMessage("Invalid Specialization")
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
    .trim()
    .escape(),
  body("city")
    .notEmpty()
    .withMessage("City is required")
    .isNumeric({ no_symbols: true })
    .isInt({ allow_leading_zeroes: false, gt: 0 })
    .withMessage("Invalid City")
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
    .isNumeric({ no_symbols: true })
    .isInt({ allow_leading_zeroes: false, gt: 0, lt: 100 })
    .withMessage("Year(s) of experience must be a positive integer")
    .trim()
    .escape(),
];
