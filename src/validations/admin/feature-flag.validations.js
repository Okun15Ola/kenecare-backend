const { body, param } = require("express-validator");
const { binaryBooleanValidator } = require("../../utils/helpers.utils");
const {
  getFeatureFlagByName,
} = require("../../repository/featureFlag.repository");

exports.createFlagValidation = [
  body("flagName")
    .trim()
    .notEmpty()
    .withMessage("Flag Name is required")
    .bail()
    .isLength({ min: 4, max: 100 })
    .withMessage("Flag Name must be between 4 to 100 characters")
    .escape()
    .custom(async (value) => {
      const flag = await getFeatureFlagByName(value);

      if (flag) {
        throw new Error(`Feature Flag with name ${value} already exist`);
      }

      return true;
    }),
  body("description").optional().isString(),
  binaryBooleanValidator("isEnabled", "IsEnabled must be a boolean value"),
  body("rolloutPercentage")
    .notEmpty()
    .isInt({ min: 1, max: 100 })
    .withMessage("Rollout Percentage must be between 1 to 100"),
];

exports.updateFlagValidation = [
  param("name")
    .trim()
    .notEmpty()
    .withMessage("Flag Name is required")
    .bail()
    .isLength({ min: 4, max: 100 })
    .withMessage("Flag Name must be between 4 to 100 characters")
    .escape()
    .custom(async (value) => {
      const flag = await getFeatureFlagByName(value);

      if (!flag) {
        throw new Error("Feature Flag Not Found.");
      }

      return true;
    }),
  body("description").optional().isString(),
  binaryBooleanValidator("isEnabled", "IsEnabled must be a boolean value"),
  body("rolloutPercentage")
    .notEmpty()
    .isInt({ min: 1, max: 100 })
    .withMessage("Rollout Percentage must be between 1 to 100"),
];

exports.flagNameValidation = [
  param("name")
    .trim()
    .notEmpty()
    .withMessage("Flag Name is required")
    .bail()
    .isLength({ min: 4, max: 100 })
    .withMessage("Flag Name must be between 4 to 100 characters")
    .escape()
    .custom(async (value) => {
      const flag = await getFeatureFlagByName(value);

      if (!flag) {
        throw new Error("Feature Flag Not Found.");
      }

      return true;
    }),
];
