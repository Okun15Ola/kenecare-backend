const { body } = require("express-validator");
const bcryptjs = require("bcryptjs");
const { getUserByMobileNumber } = require("../db/db.users");

exports.LoginValidations = [
  body("mobileNumber")
    .notEmpty()
    .withMessage("Mobile Number is required")
    .trim()
    .escape()
    .custom(async (mobileNumber, { req }) => {
      try {
        //TODO get user by mobile number
        const user = await getUserByMobileNumber(mobileNumber);

        if (!user) {
          throw new Error("Mobile Number or Password is incorrect");
        }
        req.user = user;
      } catch (error) {
        console.error(error);
        throw new Error("Mobile Number or Password is incorrect");
      }
    }),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .trim()
    .escape()
    .custom(async (password, { req }) => {
      try {
        const { user } = req;
        const isPasswordValid = await bcryptjs.compare(password, user.password);
        if (!isPasswordValid) {
          req.user = null;
          throw new Error("Mobile Number or Password is incorrect");
        }
      } catch (error) {
        console.error(error);
        throw new Error("Mobile Number or Password is incorrect");
      }
    }),
];

exports.OTPLoginValidation = [
  body("mobileNumber")
    .notEmpty()
    .withMessage("Mobile Number is required")
    .trim()
    .escape()
    .custom(async (mobileNumber, { req }) => {
      try {
        //TODO get user by mobile number
        const user = await getUserByMobileNumber(mobileNumber);

        if (!user) {
          throw new Error("Mobile Number or Password is incorrect");
        }
        req.user = user;
      } catch (error) {
        console.error(error);
        throw new Error("Mobile Number or Password is incorrect");
      }
    }),
];

exports.RegisterValidations = [
  body("name").notEmpty().withMessage("Name is required").trim().escape(),
  body("mobileNumber")
    .notEmpty()
    .withMessage("Mobile Number is required")
    .trim()
    .escape()
    .custom(async (mobileNumber, { req }) => {
      try {
        const user = await getUserByMobileNumber(mobileNumber);

        if (user) {
          throw new Error("Mobile Number already exist");
        }
      } catch (error) {
        console.error(error);
        throw new Error("Mobile Number already exist");
      }
    }),
  body("password").notEmpty().withMessage("Password is required").trim(),
  body("confirmPassword")
    .notEmpty()
    .withMessage("Confirm Password is required")
    .custom((value, { req }) => {
      if (value !== req.body.password) return false;
      return true;
    })
    .withMessage("Passwords do not match"),
];
exports.UpdatePasswordValidations = [
  body("oldPassword").notEmpty().withMessage("Password is required").trim(),
  body("newPassword").notEmpty().withMessage("Password is required").trim(),
  body("confirmNewPassword")
    .notEmpty()
    .withMessage("Confirm Password is required")
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) return false;
      return true;
    })
    .withMessage("Passwords do not match"),
];
