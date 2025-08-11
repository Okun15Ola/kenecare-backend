const { body, param } = require("express-validator");
const { getReviewById } = require("../repository/doctorReviews.repository");
const { getDoctorById } = require("../repository/doctors.repository");

exports.reviewIdValidation = [
  param("id")
    .notEmpty()
    .withMessage("Review ID is required")
    .bail()
    .isInt({ gt: 0, allow_leading_zeroes: false })
    .withMessage("Review ID must be a valid positive number")
    .bail()
    .escape()
    .custom(async (value) => {
      const review = await getReviewById(value);
      if (!review) {
        throw new Error("Review Not Found");
      }
      return true;
    }),
];

exports.reviewValidation = [
  body("doctorId")
    .notEmpty()
    .withMessage("Doctor is required")
    .bail()
    .isInt({ allow_leading_zeroes: false, gt: 0 })
    .withMessage("Invalid Doctor Id")
    .bail()
    .custom(async (doctorId) => {
      const data = await getDoctorById(doctorId);
      if (!data) {
        throw new Error("Specified Doctor Not Found");
      }
      return true;
    }),
  body("review")
    .notEmpty()
    .withMessage("Review content is required.")
    .bail()
    .isString()
    .withMessage("Review content must be a string.")
    .bail()
    .isLength({ min: 5, max: 1000 })
    .withMessage("Review content must be between 5 to 1000 characters.")
    .bail()
    .trim()
    .escape(),
];
