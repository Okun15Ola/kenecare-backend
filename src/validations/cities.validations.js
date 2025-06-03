const { body, param, query } = require("express-validator");
const {
  getCityByName,
  getCityById,
} = require("../repository/cities.repository");

exports.CreateCityValidation = [
  body("name")
    .notEmpty()
    .withMessage("City Name is required")
    .toLowerCase()
    .trim()
    .escape()
    .custom(async (value) => {
      const nameExist = await getCityByName(value);
      if (nameExist) {
        throw new Error("City with specified name already exists");
      }
      return true;
    }),
];
exports.UpdateCityValidation = [
  param("id")
    .notEmpty()
    .withMessage("City ID is required")
    .trim()
    .escape()
    .custom(async (id) => {
      const data = await getCityById(id);
      if (!data) {
        throw new Error("City with specified ID does not exist");
      }
      return true;
    }),
  body("name")
    .notEmpty()
    .withMessage("City Name is required")
    .toLowerCase()
    .trim()
    .escape()
    .custom(async (value) => {
      const nameExist = await getCityByName(value);
      if (nameExist) {
        throw new Error("City with specified name already exists");
      }
      return true;
    }),
];
exports.CityIDValidation = [
  param("id")
    .notEmpty()
    .withMessage("City ID is required")
    .trim()
    .escape()
    .custom(async (id) => {
      const data = await getCityById(id);
      if (!data) {
        throw new Error("City with specified ID does not exist");
      }
      return true;
    }),
];
exports.PathCityValidation = [
  param("id")
    .notEmpty()
    .withMessage("City ID is required")
    .trim()
    .escape()
    .custom(async (id) => {
      const data = await getCityById(id);
      if (!data) {
        throw new Error("City with specified ID does not exist");
      }
      return true;
    }),
  query("status").trim().escape(),
];
