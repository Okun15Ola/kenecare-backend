const { body, param } = require("express-validator");
const {
  getSpecializationByName,
  getSpecializationById,
} = require("../repository/specializations.repository");

exports.SpecializationValidation = [
  body("name")
    .notEmpty()
    .withMessage("Specialization Name is required")
    .toLowerCase()
    .trim()
    .isLength({ max: 150, min: 3 })
    .withMessage("Must be more than 3 characters long")
    .escape()
    .custom(async (value) => {
      const row = await getSpecializationByName(value);
      if (row) throw Error("Specialization already exist");
      return true;
    }),
  body("description")
    .notEmpty()
    .withMessage("Specialization Description is required")
    .toLowerCase()
    .trim()
    .isLength({ max: 250, min: 3 })
    .withMessage("Must be more than 3 characters long")
    .escape(),
];

exports.SpecializationIDValidation = [
  param("id")
    .notEmpty()
    .withMessage("Specialization ID is required")
    .trim()
    .escape()
    .custom(async (id) => {
      const data = await getSpecializationById(id);
      if (!data) {
        throw new Error("Specialization Not Found");
      }
    }),
];
