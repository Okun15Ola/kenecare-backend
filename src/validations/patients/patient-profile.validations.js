const { body } = require("express-validator");
const moment = require("moment");

exports.profileValidation = [
  body("firstname")
    .notEmpty()
    .withMessage("First Name is required")
    .bail()
    .isLength({ min: 1, max: 50 })
    .withMessage("First Name Must not be longer than 50 character")
    .bail()
    .trim()
    .escape(),
  body("middlename").trim().escape(),
  body("lastname")
    .notEmpty()
    .withMessage("Last Name is required")
    .bail()
    .isLength({ min: 1, max: 50 })
    .withMessage("Last Name Must not be longer than 50 character")
    .bail()
    .trim()
    .escape(),
  body("gender")
    .notEmpty()
    .withMessage("Gender is required")
    .bail()
    .trim()
    .escape()
    .toLowerCase(),
  body("dateOfBirth").custom((value) => {
    if (!value) {
      return true;
    }
    const formattedDate = moment(value).format("YYYY-MM-DD");
    if (!moment(formattedDate).isValid()) {
      throw new Error("Invalid date format. Expected format (YYYY-MM-DD)");
    }
    if (moment(formattedDate).isAfter(moment())) {
      throw new Error("Birth date must not be a future date");
    }

    if (moment().diff(formattedDate, "years") < 18) {
      throw new Error("Must be at least 18 years old");
    }
    return true;
  }),
];
