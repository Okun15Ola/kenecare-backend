const { query } = require("express-validator");
const { maxLimit } = require("../config/default.config");

exports.paginationValidation = [
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
