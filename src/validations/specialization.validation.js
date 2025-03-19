const { body } = require("express-validator");
const { getSpecializationByName } = require("../services/specialties.services");

exports.CreateSpecializationValidation = [
  body("name")
    .notEmpty()
    .withMessage("Specialization Name is required")
    .toLowerCase()
    .trim()
    .escape()
    .custom(async (name) => {
      // Get specializaiton by name
      const nameExist = await getSpecializationByName(name);
      if (nameExist) {
        throw new Error("Specialization Name Already Exists");
      }
      return true;
    }),
  body("description").trim().escape(),
];
