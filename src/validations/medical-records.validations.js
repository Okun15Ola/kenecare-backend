const { body } = require("express-validator");
const { getDoctorById } = require("../db/db.doctors");
const { getPatientMedicalDocumentById } = require("../db/db.patient-docs");
const { getUserById } = require("../db/db.users");
const { comparePassword } = require("../utils/auth.utils");

exports.CreateNewMedicalRecordValidation = [
  body("documentTitle")
    .notEmpty()
    .withMessage("Document Title is required")
    .trim()
    .escape(),
  body("password")
    .trim()
    .escape()
    .custom(async (value, { req }) => {
      if (typeof value !== "string" || value.trim() === "") {
        throw new Error("Password is required");
      }
      const user = await getUserById(req.user.id);
      if (!user) {
        throw new Error("Error uploading medical document, please try again!");
      }
      const { password } = user;
      const isMatch = await comparePassword({
        plainPassword: value,
        hashedPassword: password,
      });
      if (!isMatch) {
        throw new Error("Error Sharing Medical Document. Incorrect Password");
      }
    }),
];
exports.ShareMedicalDocumentValidation = [
  body("documentId")
    .notEmpty()
    .withMessage("Document Title is required")
    .trim()
    .escape()
    .custom(async (value) => {
      const data = await getPatientMedicalDocumentById(value);

      if (!data) {
        throw new Error("Specified Medical Document Not Found");
      }

      return true;
    }),

  body("doctorId")
    .notEmpty()
    .withMessage("Please select a doctor you wish to share document with")
    .trim()
    .escape()
    .custom(async (value) => {
      const data = await getDoctorById(value);

      if (!data) {
        throw new Error("Specified Doctor Not Found");
      }
      return true;
    }),
  body("note").trim().escape(),
  body("password")
    .trim()
    .escape()
    .custom(async (value, { req }) => {
      if (typeof value !== "string" || value.trim() === "") {
        throw new Error("Password is required");
      }
      const user = await getUserById(req.user.id);
      if (!user) {
        throw new Error("Error uploading medical document, please try again!");
      }
      const { password } = user;
      const isMatch = await comparePassword({
        plainPassword: value,
        hashedPassword: password,
      });
      if (!isMatch) {
        throw new Error("Error Sharing Medical Document. Incorrect Password");
      }
    }),
];
