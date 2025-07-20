const { query } = require("express-validator");

exports.paginationValidation = [
  query("page")
    .optional()
    .default(1)
    .isInt({ min: 1 })
    .withMessage("Page must be a positive number")
    .toInt(),
  query("limit")
    .optional()
    .default(10)
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be a number between 1 and 100")
    .toInt(),
];
