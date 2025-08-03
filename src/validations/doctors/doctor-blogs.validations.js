const { param, body } = require("express-validator");
const moment = require("moment");
const he = require("he");

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
    .trim()
    .withMessage("Title must be between 5 and 200 characters")
    .customSanitizer((value) => {
      return he.encode(value);
    }),

  body("content")
    .notEmpty()
    .bail()
    .withMessage("Content is required")
    .isString()
    .bail()
    .withMessage("Content must be a string")
    .isLength({ min: 100, max: 2000 })
    .bail()
    .withMessage("Content must be between 100 to 2000 characters")
    .customSanitizer((value) => {
      return he.encode(value);
    }),

  body("tags")
    .optional()
    .customSanitizer((value) => {
      if (!value) return null;
      if (Array.isArray(value)) return value;

      // If it's a string that looks like JSON, parse it
      if (typeof value === "string") {
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {
          console.error("Failed to parse tags JSON:", e);
          // If it's not valid JSON, treat as a single tag
          return [value];
        }
      }

      // If it's anything else, convert to string and make it a single tag
      return [String(value)];
    })
    .custom((value) => {
      if (!value) return true;
      if (
        !Array.isArray(value) ||
        !value.every((tag) => typeof tag === "string")
      ) {
        throw new Error("Tags must be an array of strings");
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

  body("publishedAt").custom((value, { req }) => {
    const { status } = req.body;

    // SCHEDULED: Require future date
    if (status === "scheduled") {
      if (!value) {
        throw new Error("Published date is required for scheduled posts");
      }

      const publishDate = moment(value);

      if (!publishDate.isValid()) {
        throw new Error("Published date must be a valid date");
      }

      if (publishDate.isSameOrBefore(moment())) {
        throw new Error("Scheduled publish date must be in the future");
      }
    }

    // PUBLISHED
    if (status === "published") {
      req.body.publishedAt = moment().format();
    }

    return true;
  }),
];

exports.updateBlogStatusValidation = [
  body("status")
    .notEmpty()
    .bail()
    .withMessage("Status is required")
    .isIn(["published", "archived"])
    .bail()
    .withMessage("Status must be one of: published, archived"),
];
