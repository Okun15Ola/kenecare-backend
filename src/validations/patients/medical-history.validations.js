const { body } = require("express-validator");
const { binaryBooleanValidator } = require("../../utils/helpers.utils");
/**
 * Validation rules for creating a new patient medical history record
 */
exports.createMedicalHistoryValidation = [
  body("height")
    .optional()
    .isString()
    .isLength({ max: 20 })
    .withMessage("Height must be less than 20 characters")
    .bail()
    .escape(),

  body("weight")
    .optional()
    .isString()
    .isLength({ max: 20 })
    .withMessage("Weight must be less than 20 characters")
    .bail()
    .escape(),

  body("allergies")
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage("Allergies must be less than 500 characters")
    .bail()
    .escape(),

  binaryBooleanValidator(
    "isDisabled",
    "Is patient disabled must be a boolean value",
  ),

  body("disabilityDesc")
    .optional()
    .isString()
    .isLength({ max: 255 })
    .withMessage("Disability description must be less than 255 characters")
    .bail()
    .escape()
    .custom((value, { req }) => {
      // Disability description required if patient is disabled
      if (req.body.isDisabled === 1 && !value) {
        throw new Error(
          "Disability description is required when patient is disabled",
        );
      }
      return true;
    }),

  binaryBooleanValidator(
    "useTobacco",
    "Tobacco intake must be a boolean value",
  ),

  body("tobaccoIntakeFreq")
    .optional()
    .isString()
    .isLength({ max: 100 })
    .withMessage("Tobacco intake frequency must be a string")
    .bail()
    .escape()
    .custom((value, { req }) => {
      // Frequency required if tobacco use is true
      if (req.body.useTobacco === 1 && !value) {
        throw new Error(
          "Tobacco intake frequency is required when tobacco intake is true",
        );
      }
      return true;
    }),

  binaryBooleanValidator(
    "alcoholIntake",
    "Alcohol intake must be a boolean value",
  ),

  body("alcoholIntakeFreq")
    .optional()
    .isString()
    .isLength({ max: 100 })
    .withMessage("Alcohol intake frequency must be a string")
    .bail()
    .escape()
    .custom((value, { req }) => {
      // Frequency required if alcohol use is true
      if (req.body.alcoholIntake === 1 && !value) {
        throw new Error(
          "Alcohol intake frequency is required when alcohol intake is true",
        );
      }
      return true;
    }),

  binaryBooleanValidator(
    "caffineIntake",
    "Caffeine Intake must be a boolean value",
  ),

  body("caffineIntakeFreq")
    .optional()
    .isString()
    .isLength({ max: 100 })
    .withMessage("Caffeine intake frequency must be a string")
    .bail()
    .escape()
    .custom((value, { req }) => {
      // Frequency required if caffeine use is true
      if (req.body.caffineIntake === 1 && !value) {
        throw new Error(
          "Caffeine intake frequency is required when caffeine intake is true",
        );
      }
      return true;
    }),
];
