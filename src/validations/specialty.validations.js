const { body, param } = require("express-validator");
const {
  getSpecialtyByName,
  getSpecialtiyById,
} = require("../repository/specialities.repository");

exports.CreateSpecialtyValidation = [
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .bail()
    .toLowerCase()
    .trim()
    .escape()
    .custom(async (name) => {
      const data = await getSpecialtyByName(name);
      if (data) {
        throw new Error("Specified Specialty Name Already Exists");
      }
      return true;
    }),
  body("description")
    .notEmpty()
    .withMessage("Description is required")
    .toLowerCase()
    .trim()
    .escape(),
];
exports.UpdateSpecialtyValidation = [
  param("id")
    .notEmpty()
    .withMessage("Specialty ID is required")
    .isInt({ allow_leading_zeroes: false })
    .withMessage("Speciality Id should be a numeric value")
    .bail()
    .trim()
    .escape()
    .custom(async (value) => {
      const data = await getSpecialtiyById(value);
      if (!data) {
        throw new Error("Specialty Not Found");
      }
      return true;
    }),
  body("name")
    .notEmpty()
    .withMessage("Specialty Name is required")
    .toLowerCase()
    .trim()
    .isLength({ max: 150, min: 3 })
    .withMessage("Must be between 3 to 150 characters")
    .escape(),
  body("description")
    .notEmpty()
    .withMessage("Description is required")
    .toLowerCase()
    .trim()
    .escape(),
  body("tags").toLowerCase().trim().escape(),
];
exports.SpecialtyIDValidation = [
  param("id")
    .notEmpty()
    .withMessage("Specialty ID is required")
    .trim()
    .escape()
    .custom(async (id) => {
      const data = await getSpecialtiyById(id);
      if (!data) {
        throw new Error("Specialty Not Found");
      }
    }),
];
