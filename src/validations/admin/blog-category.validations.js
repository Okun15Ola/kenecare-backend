const { body } = require("express-validator");

exports.blogCategoryValidations = [
  body("name")
    .notEmpty()
    .withMessage("Blog Category Name is required")
    .bail()
    .toLowerCase()
    .trim()
    .isLength({ max: 150, min: 3 })
    .withMessage("Must be more than 3 characters long")
    .bail()
    .escape(),
];
