const { body } = require("express-validator");
const { getDoctorById } = require("../db/db.doctors");
const { getPatientMedicalDocumentById } = require("../db/db.patient-docs");

exports.CreateNewMedicalRecordValidation = [
  body("documentTitle")
    .notEmpty()
    .withMessage("Document Title is required")
    .trim()
    .escape(),
];
exports.ShareMedicalDocumentValidation = [
  body("documentId")
    .notEmpty()
    .withMessage("Document Title is required")
    .trim()
    .escape()
    .custom(async (value, { req }) => {
      const data = await getPatientMedicalDocumentById(value);

      if (!data) {
        throw new Error("Specified Medical Document Not Found");
      }

      return true;
    }),

  body("doctorId")
    .notEmpty()
    .withMessage("Document Title is required")
    .trim()
    .escape()
    .custom(async (value, { req }) => {
      const data = await getDoctorById(value);

      if (!data) {
        throw new Error("Specified Doctor Not Found");
      }
      return true;
    }),
  body("note").trim().escape(),
];
