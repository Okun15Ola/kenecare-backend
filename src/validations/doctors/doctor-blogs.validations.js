const { param, body } = require("express-validator");
const moment = require("moment");

exports.blogUuidValidation = [
  param("blogUuid")
    .notEmpty()
    .bail()
    .withMessage("Blog UUID is required")
    .isUUID()
    .bail()
    .withMessage("Blog UUID must be a valid UUID"),
];

exports.blogValidation = [
  body("title")
    .notEmpty()
    .bail()
    .withMessage("Title is required")
    .isString()
    .bail()
    .withMessage("Title must be a string")
    .isLength({ min: 5, max: 200 })
    .bail()
    .withMessage("Title must be between 5 and 200 characters"),

  body("content")
    .notEmpty()
    .bail()
    .withMessage("Content is required")
    .isString()
    .bail()
    .withMessage("Content must be a string")
    .isLength({ min: 100, max: 2000 })
    .bail()
    .withMessage("Content must be between 100 to 2000 characters"),

  body("tags")
    .optional()
    .isArray()
    .bail()
    .withMessage("Tags must be an array")
    .custom((tags) => {
      if (!tags.every((tag) => typeof tag === "string")) {
        throw new Error("All tags must be strings");
      }
      return true;
    }),

  body("status")
    .optional()
    .isIn(["draft", "published", "scheduled", "archived"])
    .bail()
    .withMessage(
      "Status must be one of: draft, published, scheduled, archived",
    ),

  body("publishedAt")
    .optional()
    .custom((value, { req }) => {
      if (req.body.status === "scheduled" && !value) {
        throw new Error("Published date is required for scheduled posts");
      }

      if (value) {
        const publishDate = moment(value);

        // Check if the date is valid
        if (!publishDate.isValid()) {
          throw new Error("Published date must be a valid date");
        }

        // For scheduled posts, ensure date is in the future
        if (
          req.body.status === "scheduled" &&
          publishDate.isSameOrBefore(moment())
        ) {
          throw new Error("Published date must be in the future");
        }
      }

      return true;
    }),
];

exports.updateBlogStatusValidation = [
  param("status")
    .notEmpty()
    .bail()
    .withMessage("Status is required")
    .isIn(["draft", "published", "scheduled", "archived"])
    .bail()
    .withMessage(
      "Status must be one of: draft, published, scheduled, archived",
    ),
];
