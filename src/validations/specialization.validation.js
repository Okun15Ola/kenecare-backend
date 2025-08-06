const { body, param } = require("express-validator");
const {
  getSpecializationByName,
  getSpecializationById,
} = require("../repository/specializations.repository");

exports.SpecializationValidation = [
  body("name")
    .notEmpty()
    .withMessage("Specialization Name is required")
    .bail()
    .trim()
    .isLength({ max: 150, min: 3 })
    .withMessage("Must be more than 3 characters long")
    .bail()
    .escape()
    .custom(async (value) => {
      const row = await getSpecializationByName(value);
      if (row) throw Error("Specialization already exist");
      return true;
    }),
  body("description")
    .notEmpty()
    .withMessage("Specialization Description is required")
    .bail()
    .isLength({ max: 250, min: 3 })
    .withMessage("Must be more than 3 characters long")
    .trim()
    .escape(),
];

exports.SpecializationIDValidation = [
  param("id")
    .notEmpty()
    .withMessage("Specialization ID is required")
    .bail()
    .trim()
    .escape()
    .isInt({ gt: 0 })
    .withMessage("Specialization ID must be a positive number")
    .bail()
    .custom(async (id) => {
      const data = await getSpecializationById(id);
      if (!data) {
        throw new Error("Specialization Not Found");
      }
      return true;
    }),
];
