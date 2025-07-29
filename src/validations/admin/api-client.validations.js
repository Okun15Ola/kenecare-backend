const { body, param } = require("express-validator");
const he = require("he");
const { getApiClientByUuid } = require("../../repository/apiClient.repository");

exports.clientUuidValidations = [
  param("clientUuid")
    .isUUID()
    .withMessage("A valid uuid is required")
    .bail()
    .trim()
    .escape()
    .custom(async (value) => {
      const client = await getApiClientByUuid(value);
      if (!client) {
        throw new Error("Client Not Found");
      }
      return true;
    }),
];

exports.createClientValidations = [
  body("clientName")
    .notEmpty()
    .withMessage("Client name is required")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Client name must be between 2 and 100 characters")
    .escape(),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters")
    .escape(),

  body("email")
    .notEmpty()
    .withMessage("Email address is required")
    .trim()
    .isEmail()
    .withMessage("Must provide a valid email address")
    .normalizeEmail(),

  body("phone").optional().trim().escape(),

  body("website")
    .optional()
    .trim()
    .isURL({
      protocols: ["http", "https"],
      require_protocol: true,
    })
    .withMessage(
      "Must provide a valid website URL (include http:// or https://)",
    )
    .customSanitizer((value) => {
      return he.encode(value);
    }),
];
