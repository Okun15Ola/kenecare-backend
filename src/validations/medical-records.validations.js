const { body, param } = require("express-validator");
const {
  getDoctorById,
  getDoctorByUserId,
} = require("../repository/doctors.repository");
const {
  getPatientMedicalDocumentById,
  getDoctorSharedMedicalDocumentById,
} = require("../repository/patient-docs.repository");
const { getUserById } = require("../repository/users.repository");
const { comparePassword } = require("../utils/auth.utils");
const {
  getPatientMedicalDocumentByDocumentId,
} = require("../repository/patient-docs.repository");
const { getPatientByUserId } = require("../repository/patients.repository");

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

exports.MedicalRecordIdValidation = [
  param("id")
    .notEmpty()
    .withMessage("Document Id is required")
    .bail()
    .trim()
    .escape()
    .custom(async (value, { req }) => {
      const { patient_id: patientId } = await getPatientByUserId(req.user.id);
      if (!patientId) {
        throw new Error("Error fetching document");
      }
      const documentId = parseInt(value, 10);
      const data = await getPatientMedicalDocumentByDocumentId({
        documentId,
        patientId,
      });
      if (!data) {
        throw new Error("Specified Document Not Found");
      }
      return true;
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
        console.log("Wrong password");
        throw new Error("Error Sharing Medical Document. Incorrect Password");
      }
      return true;
    }),
];

exports.GetDoctorSharedMedicalDocumentValidation = [
  param("id")
    .notEmpty()
    .withMessage("Document ID is Required")
    .bail()
    .custom(async (value, { req }) => {
      const userId = parseInt(req.user.id, 10);
      const sharedDocumentId = parseInt(value, 10);
      const doctor = await getDoctorByUserId(userId);
      if (!doctor) {
        throw new Error("Unauthorized Action. Please Try again");
      }
      const { doctor_id: doctorId } = doctor;
      const document = await getDoctorSharedMedicalDocumentById({
        doctorId,
        sharedDocumentId,
      });
      if (!document) {
        throw new Error("Specified Document Not Found");
      }
      return true;
    }),
];

exports.GetPatientSharedMedicalDocumentValidation = [
  param("id")
    .notEmpty()
    .withMessage("Document ID is Required")
    .bail()
    .custom(async (value, { req }) => {
      const userId = parseInt(req.user.id, 10);
      const sharedDocumentId = parseInt(value, 10);
      const patient = await getPatientByUserId(userId);
      if (!patient) {
        throw new Error("Unauthorized Action. Please Try again");
      }
      const document = await getPatientMedicalDocumentById(sharedDocumentId);
      if (!document) {
        throw new Error("Specified Document Not Found");
      }
      return true;
    }),
];

exports.VerifySharedMedicalDocumentPasswordValidation = [
  body("id")
    .notEmpty()
    .withMessage("Document ID is Required")
    .bail()
    .custom(async (value, { req }) => {
      const userId = parseInt(req.user.id, 10);
      const sharedDocumentId = parseInt(value, 10);
      const doctor = await getDoctorByUserId(userId);
      if (!doctor) {
        throw new Error("Unauthorized Action. Please Try again");
      }
      const { doctor_id: doctorId } = doctor;
      const document = await getDoctorSharedMedicalDocumentById({
        doctorId,
        sharedDocumentId,
      });
      if (!document) {
        throw new Error("Specified Document Not Found");
      }
      return true;
    }),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .bail()
    .trim()
    .escape()
    .custom(async (password, { req }) => {
      const user = await getUserById(req.user.id);
      if (!user) {
        throw new Error(
          "Authentication failed. Please verify your password and try again.",
        );
      }

      const { password: hashedPassword } = user;
      const isMatch = await comparePassword({
        plainPassword: password,
        hashedPassword,
      });

      if (!isMatch) {
        throw new Error(
          "Authentication failed. Please verify your password and try again.",
        );
      }
      return true;
    }),
];

exports.VerifyPatientMedicalDocumentPasswordValidation = [
  body("id")
    .notEmpty()
    .withMessage("Document ID is Required")
    .bail()
    .custom(async (value, { req }) => {
      const userId = parseInt(req.user.id, 10);
      const docId = parseInt(value, 10);
      const patient = await getPatientByUserId(userId);
      if (!patient) {
        throw new Error("Unauthorized Action. Please Try again");
      }
      // const { patient_id: patientId } = patient;
      const document = await getPatientMedicalDocumentById(docId);
      if (!document) {
        throw new Error("Specified Document Not Found");
      }
      return true;
    }),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .bail()
    .trim()
    .escape()
    .custom(async (password, { req }) => {
      const user = await getUserById(req.user.id);
      if (!user) {
        throw new Error(
          "Authentication failed. Please verify your password and try again.",
        );
      }

      const { password: hashedPassword } = user;
      const isMatch = await comparePassword({
        plainPassword: password,
        hashedPassword,
      });

      if (!isMatch) {
        throw new Error(
          "Authentication failed. Please verify your password and try again.",
        );
      }
      return true;
    }),
];
