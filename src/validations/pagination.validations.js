const { query } = require("express-validator");
const { maxLimit } = require("../config/default.config");

exports.paginationValidation = [
  query("page")
    .default(1)
    .isInt({ min: 1 })
    .withMessage("Invalid Page")
    .bail()
    .toInt(),
  query("limit")
    .default(10)
    .isInt({ min: 1, max: parseInt(maxLimit, 10) })
    .withMessage(
      `Limit must be a number between 1 and ${parseInt(maxLimit, 10)}`,
    )
    .bail()
    .toInt(),
];
