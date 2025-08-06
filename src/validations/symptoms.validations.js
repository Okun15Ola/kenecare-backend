const { body, param } = require("express-validator");
const { getSpecialtiyById } = require("../repository/specialities.repository");
const {
  getCommonSymptomByName,
  getCommonSymptomById,
} = require("../repository/common-symptoms.repository");

exports.CreateSymptomValidation = [
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .bail()
    .toLowerCase()
    .trim()
    .escape()
    .custom(async (name) => {
      const data = await getCommonSymptomByName(name);
      if (data) {
        throw new Error("Specified  Name Already Exists");
      }
      return true;
    }),
  body("description")
    .notEmpty()
    .withMessage("Description is required")
    .bail()
    .toLowerCase()
    .trim()
    .escape(),
  body("consultationFee")
    .notEmpty()
    .withMessage("Consultation Fee is required")
    .bail()
    .isNumeric({ no_symbols: true })
    .withMessage("Invalid Consultation Fee Specified")
    .bail()
    .trim()
    .escape(),
  body("specialtyId")
    .notEmpty()
    .withMessage("Specialty ID is required")
    .bail()
    .isInt({ gt: 0 })
    .trim()
    .escape()
    .custom(async (value) => {
      const id = parseInt(value, 10);
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
    .bail()
    .isInt({ gt: 0 })
    .trim()
    .escape()
    .custom(async (value) => {
      const data = await getCommonSymptomById(value);

      if (!data) {
        throw new Error("Common Symptom Not Found");
      }
      return true;
    }),
  body("name")
    .notEmpty()
    .withMessage("Common Symptom Name is required")
    .bail()
    .toLowerCase()
    .trim()
    .isLength({ max: 150, min: 3 })
    .withMessage("Must be between 3 to 150 characters")
    .escape(),
  body("description")
    .notEmpty()
    .withMessage("Description is required")
    .bail()
    .trim()
    .escape(),
  body("consultationFee")
    .notEmpty()
    .withMessage("Consultation Fee is required")
    .bail()
    .isNumeric({ no_symbols: true })
    .withMessage("Invalid Consultation Fee Specified")
    .trim()
    .escape(),
  body("specialtyId")
    .notEmpty()
    .withMessage("Specialty ID is required")
    .bail()
    .isInt({ gt: 0 })
    .trim()
    .escape()
    .custom(async (value) => {
      const id = parseInt(value, 10);
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
    .bail()
    .isInt({ gt: 0 })
    .trim()
    .escape()
    .custom(async (id) => {
      const data = await getSpecialtiyById(id);
      if (!data) {
        throw new Error("Specialty Not Found");
      }
      return true;
    }),
];
