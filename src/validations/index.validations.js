const { param, query } = require("express-validator");
const { getDoctorById } = require("../repository/doctors.repository");
const { getSpecialtiyById } = require("../repository/specialities.repository");
const { getCityById } = require("../repository/cities.repository");
const { maxLimit } = require("../config/default.config");

exports.doctorIdValidation = [
  param("id")
    .notEmpty()
    .withMessage("Specify Doctor Id")
    .escape()
    .trim()
    .custom(async (value) => {
      const id = parseInt(value, 10);

      const isValidNumber = Number.isSafeInteger(id);
      if (!isValidNumber) {
        throw new Error("Please provide a valid ID");
      }
      const doctorId = Number(id);
      const data = await getDoctorById(doctorId);
      if (!data) {
        throw new Error("Doctor Not Found");
      }
      return true;
    }),
];

exports.doctorPaginationValidation = [
  query("specialty_id")
    .optional()
    .isInt({ min: 1, allow_leading_zeroes: false })
    .withMessage("Specialty ID must be a number greater than 0")
    .bail()
    .toInt()
    .custom(async (value) => {
      const data = await getSpecialtiyById(value);
      if (!data) {
        throw new Error("Specialty Not Found");
      }
      return true;
    }),

  query("locationId")
    .optional()
    .isInt({ min: 1, allow_leading_zeroes: false })
    .withMessage("Location ID must be a number greater than 0")
    .bail()
    .toInt()
    .custom(async (value) => {
      const data = await getCityById(value);
      if (!data) {
        throw new Error("Location Not Found");
      }
      return true;
    }),

  query("q")
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage("Search query must be between 2 and 100 characters")
    .bail()
    .trim()
    .escape()
    .matches(/^[a-zA-Z0-9\s\-.]+$/)
    .withMessage("Search query contains invalid characters"),
  query("page")
    .default(1)
    .isInt({ min: 1 })
    .withMessage("Page must be a positive number")
    .toInt(),
  query("limit")
    .default(10)
    .isInt({ min: 1, max: maxLimit })
    .withMessage(`Limit must be a number between 1 and ${maxLimit}`)
    .toInt(),
];
