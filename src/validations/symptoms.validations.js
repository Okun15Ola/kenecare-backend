const { body, param, check } = require("express-validator");
const { getSpecialtiyById } = require("../db/db.specialities");
const {
  getCommonSymptomByName,
  getCommonSymptomById,
} = require("../db/db.common-symptoms");

exports.CreateSymptomValidation = [
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .toLowerCase()
    .trim()
    .escape()
    .custom(async (name, { req }) => {
      const data = await getCommonSymptomByName(name);
      if (data) {
        throw new Error("Specified  Name Already Exists");
      }
      return true;
    }),
  body("description")
    .notEmpty()
    .withMessage("Description is required")
    .toLowerCase()
    .trim()
    .escape(),
  body("consultationFee")
    .notEmpty()
    .withMessage("Consultation Fee is required")
    .isNumeric({ no_symbols: true })
    .withMessage("Invalid Consultation Fee Specified")
    .trim()
    .escape(),
  body("specialtyId")
    .notEmpty()
    .withMessage("Specialty ID is required")
    .isNumeric({ no_symbols: true })
    .trim()
    .escape()
    .custom(async (value, { req }) => {
      const id = parseInt(value);
      const found = await getSpecialtiyById(id);

      if (!found) {
        throw new Error("Invalid Specialty ID");
      }
      return true;
    }),
  body("tags").trim().escape(),
];
exports.UpdateSymptomValidation = [
  param("id")
    .notEmpty()
    .withMessage("Common Symptom ID is required")
    .trim()
    .escape()
    .custom(async (value, { req }) => {
      const data = await getCommonSymptomById(value);

      if (!data) {
        throw new Error("Common Symptom Not Found");
      }
      return true;
    }),
  body("name")
    .notEmpty()
    .withMessage("Common Symptom Name is required")
    .toLowerCase()
    .trim()
    .isLength({ max: 150, min: 3 })
    .withMessage("Must be between 3 to 150 characters")
    .escape(),
  body("description")
    .notEmpty()
    .withMessage("Description is required")
    .trim()
    .escape(),
  body("consultationFee")
    .notEmpty()
    .withMessage("Consultation Fee is required")
    .isNumeric({ no_symbols: true })
    .withMessage("Invalid Consultation Fee Specified")
    .trim()
    .escape(),
  body("specialtyId")
    .notEmpty()
    .withMessage("Specialty ID is required")
    .isNumeric({ no_symbols: true })
    .trim()
    .escape()
    .custom(async (value, { req }) => {
      const id = parseInt(value);
      const found = await getSpecialtiyById(id);

      if (!found) {
        throw new Error("Invalid Specialty ID");
      }
      return true;
    }),
  body("tags").trim().escape(),
];
exports.SpecialtyIDValidation = [
  param("id")
    .notEmpty()
    .withMessage("Specialty ID is required")
    .trim()
    .escape()
    .custom(async (id, { req }) => {
      const data = await getSpecialtiyById(id);
      if (!data) {
        throw new Error("Specialty Not Found");
      }
    }),
];
