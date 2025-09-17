const { body, param } = require("express-validator");
const { getActiveApiKeyByUuid } = require("../../repository/apiKey.repository");
const { getApiClientById } = require("../../repository/apiClient.repository");

exports.keyUuidValidations = [
  param("keyUuid")
    .isUUID()
    .withMessage("A valid UUID is required")
    .bail()
    .trim()
    .escape()
    .custom(async (value) => {
      const client = await getActiveApiKeyByUuid(value);
      if (!client) {
        throw new Error("API KEY Not Found");
      }
      return true;
    }),
];

exports.createKeyValidations = [
  body("clientId")
    .notEmpty()
    .withMessage("Client ID is required")
    .bail()
    .isInt({ allow_leading_zeroes: false, gt: 0 })
    .withMessage("Client ID must be a valid ID")
    .bail()
    .custom(async (clientId) => {
      const data = await getApiClientById(clientId);
      if (!data) {
        throw new Error("Client Not Found");
      }
      return true;
    }),
  body("name")
    .notEmpty()
    .withMessage("API key name is required")
    .bail()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Name cannot exceed 100 characters")
    .escape(),
  body("description").optional().trim().escape(),
  body("environment")
    .notEmpty()
    .withMessage("Environment is required")
    .trim()
    .isIn(["development", "staging", "production", "testing"])
    .withMessage(
      "Environment must be one of: development, staging, production, testing",
    )
    .default("development"),
];
