const { body, param } = require("express-validator");
const he = require("he");
const { getFaqByUuid } = require("../../repository/faqs.repository");
const { binaryBooleanValidator } = require("../../utils/helpers.utils");

exports.faqValidation = [
  body("question")
    .trim()
    .notEmpty()
    .withMessage("Question is required")
    .bail()
    .isLength({ min: 5, max: 500 })
    .withMessage("Question must be between 5 to 500 characters")
    .escape()
    .customSanitizer((value) => {
      return he.encode(value);
    }),
  body("answer")
    .trim()
    .notEmpty()
    .withMessage("Answer is required")
    .bail()
    .isLength({ min: 10, max: 500 })
    .withMessage("Answer must be between 10 to 500 characters")
    .escape()
    .customSanitizer((value) => {
      return he.encode(value);
    }),
  body("category")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Category cannot exceed 100 characters")
    .escape(),
  binaryBooleanValidator("isPublished", "IsPublished must be a boolean value"),
];

exports.faqIdParamValidation = [
  param("id")
    .isUUID()
    .withMessage("Invalid FAQ UUID")
    .bail()
    .trim()
    .escape()
    .custom(async (value) => {
      const faq = await getFaqByUuid(value);
      if (!faq) {
        throw new Error("FAQ Not Found");
      }
      return true;
    }),
];
