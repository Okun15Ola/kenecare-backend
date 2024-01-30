const { body } = require("express-validator");

exports.CreateNewMedicalRecordValidation = [
  body("documentTitle")
    .notEmpty()
    .withMessage("Document Title is required")
    .trim()
    .escape(),
];
