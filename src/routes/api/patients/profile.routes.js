const router = require("express").Router();
const { body, param } = require("express-validator");
const moment = require("moment");
const { Validate } = require("../../../validations/validate");
const {
  GetPatientProfileController,
  CreatePatientProfileController,
  UpdatePatientProfileController,
  UpdatePatientProfilePictureController,
} = require("../../../controllers/patients/profile.controller");
const { getPatientById } = require("../../../db/db.patients");
const { USERTYPE } = require("../../../utils/enum.utils");
const { localProfilePicUploader } = require("../../../utils/file-upload.utils");

router.get("/profile", GetPatientProfileController);
router.post(
  "/profile",
  [
    body("firstname")
      .notEmpty()
      .withMessage("First Name is required")
      .isLength({ min: 1, max: 50 })
      .withMessage("First Name Must not be longer than 50 character")
      .trim()
      .escape(),
    body("middlename").trim().escape(),
    body("lastname")
      .notEmpty()
      .withMessage("Last Name is required")
      .isLength({ min: 1, max: 50 })
      .withMessage("Last Name Must not be longer than 50 character")
      .trim()
      .escape(),
    body("gender")
      .notEmpty()
      .withMessage("Gender is required")
      .trim()
      .escape()
      .toLowerCase(),
    body("dateOfBirth")
      .notEmpty()
      .withMessage("Date of Birth is required")
      .custom((value, { req }) => {
        if (moment(value, "DD/MM/YYYY").isAfter(moment())) {
          throw new Error("Birth date must not be earlier than today");
        }
        return true;
      }),
  ],
  Validate,
  CreatePatientProfileController
);
router.put(
  "/profile/",
  [
    body("firstname")
      .notEmpty()
      .withMessage("First Name is required")
      .isLength({ min: 1, max: 50 })
      .withMessage("First Name Must not be longer than 50 character")
      .trim()
      .escape(),
    body("middlename").trim().escape(),
    body("lastname")
      .notEmpty()
      .withMessage("Last Name is required")
      .isLength({ min: 1, max: 50 })
      .withMessage("Last Name Must not be longer than 50 character")
      .trim()
      .escape(),
    body("gender")
      .notEmpty()
      .withMessage("Gender is required")
      .trim()
      .escape()
      .toLowerCase(),
    body("dateOfBirth")
      .notEmpty()
      .withMessage("Date of Birth is required")
      .custom((value, { req }) => {
        if (moment(value, "DD/MM/YYYY").isAfter(moment())) {
          throw new Error("Birth date must not be earlier than today");
        }
        return true;
      }),
  ],
  Validate,
  UpdatePatientProfileController
);
router.patch(
  "/profile/",
  localProfilePicUploader.single("profilepic"),
  UpdatePatientProfilePictureController
);

module.exports = router;
