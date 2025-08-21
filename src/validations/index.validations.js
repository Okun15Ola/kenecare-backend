const { param, query, body } = require("express-validator");
const he = require("he");
const { getDoctorById } = require("../repository/doctors.repository");
const { getSpecialtiyById } = require("../repository/specialities.repository");
const { getCityById } = require("../repository/cities.repository");
const { maxLimit } = require("../config/default.config");

exports.doctorIdValidation = [
  param("id")
    .notEmpty()
    .withMessage("Specify Doctor Id")
    .bail()
    .isInt({ gt: 0 })
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
    .trim()
    .escape()
    .isInt({ gt: 0, allow_leading_zeroes: false })
    .withMessage("Specialty ID must be a number greater than 0")
    .bail()
    .custom(async (value) => {
      const data = await getSpecialtiyById(value);
      if (!data) {
        throw new Error("Specialty Not Found");
      }
      return true;
    }),

  query("locationId")
    .optional()
    .trim()
    .escape()
    .isInt({ gt: 0, allow_leading_zeroes: false })
    .withMessage("Location ID must be a number greater than 0")
    .bail()
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
    .withMessage("Search query contains invalid characters")
    .bail(),
  query("page")
    .default(1)
    .trim()
    .escape()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive number")
    .bail()
    .toInt(),
  query("limit")
    .default(10)
    .trim()
    .escape()
    .isInt({ min: 1, max: parseInt(maxLimit, 10) })
    .withMessage(
      `Limit must be a number between 1 and ${parseInt(maxLimit, 10)}`,
    )
    .bail()
    .toInt(),
];

exports.patientTestimonialValidation = [
  body("content")
    .notEmpty()
    .withMessage("Testimonial content is required")
    .bail()
    .isLength({ min: 10, max: 450 })
    .withMessage("Content must be within 10 to 450 characters long.")
    .bail()
    .trim()
    .escape()
    .customSanitizer((value) => {
      return he.encode(value);
    }),
];
