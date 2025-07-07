const { query } = require("express-validator");

exports.adminAppointmentPaginationValidation = [
  query("page")
    .optional()
    .default(1)
    .isInt({ min: 1 })
    .toInt()
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .default(20)
    .isInt({ min: 1 })
    .toInt()
    .withMessage("Limit must be a positive integer"),
];
