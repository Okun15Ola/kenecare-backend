const { body } = require("express-validator");
const { getDoctorById } = require("../db/db.doctors");
const { getPatientMedicalDocumentById } = require("../db/db.patient-docs");

exports.CreateNewMedicalRecordValidation = [
  body("documentTitle")
    .notEmpty()
    .withMessage("Document Title is required")
    .trim()
    .escape(),
  // body("password")
  //   .trim()
  //   .escape()
  //   .custom(async (value, ) => {
  //     if (value === "") {
  //       throw new Error("Password is required");
  //     }
  //     const user = await getUserById(req.user.id);
  //     if (user) {
  //       const { password } = user;

  //       const isMatch = await bcrypt.compare(value, password);
  //       if (!isMatch) {
  //         throw new Error("Incorrect Password");
  //       }
  //       return true;
  //     }
  //   }),
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
    .withMessage("Doctor Id is required")
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
];
