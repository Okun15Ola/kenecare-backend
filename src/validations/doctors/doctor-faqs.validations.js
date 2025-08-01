const { param, body } = require("express-validator");
const { binaryBooleanValidator } = require("../../utils/helpers.utils");
const {
  validateDoctorFaqId,
} = require("../../repository/doctorFaqs.repository");

exports.faqIdValidation = [
  param("id")
    .notEmpty()
    .bail()
    .withMessage("FAQ ID is required")
    .isInt({ gt: 0, allow_leading_zeroes: false })
    .bail()
    .withMessage("FAQ ID must be a positive number")
    .custom(async (value) => {
      const data = await validateDoctorFaqId(value);
      if (!data) {
        throw new Error("Faq not found");
      }
    }),
];

exports.faqContentValidation = [
  body("question")
    .notEmpty()
    .bail()
    .withMessage("Question is required")
    .isString()
    .bail()
    .withMessage("Question must be a string")
    .isLength({ min: 10, max: 250 })
    .bail()
    .withMessage("Question must be between 10 and 250 characters"),
  body("answer")
    .notEmpty()
    .bail()
    .withMessage("Answer is required")
    .isString()
    .bail()
    .withMessage("Answer must be a string")
    .isLength({ min: 3, max: 1000 })
    .bail()
    .withMessage("Answer must be between 3 and 1000 characters"),
];

exports.updateDoctorFaqStatusValidation = [
  binaryBooleanValidator("isActive", "Is active must be a boolean value"),
];
