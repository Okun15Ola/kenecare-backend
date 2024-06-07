const { body, param, query } = require("express-validator");
const {
  getAdminById,
  getAdminByEmail,
  getAdminByMobileNumber,
} = require("../services/admins.services");
const { comparePassword } = require("../utils/auth.utils");
const { STATUS } = require("../utils/enum.utils");

exports.AdminLoginValidations = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Must be a valid email address")
    .trim()
    .escape()
    .custom(async (email, { req }) => {
      if (!email.endsWith("@kenecare.com")) {
        throw new Error("Unauthorized email address provider");
      }

      const user = await getAdminByEmail(email);

      if (!user) {
        throw new Error("Not A registered Email address");
      }
      req.user = user;
      return true;
    }),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .trim()
    .escape()
    .custom(async (password, { req }) => {
      if (req.user) {
        const { accountActive, password: hashedPassword } = req.user;
        const isMatch = await comparePassword({
          plainPassword: password,
          hashedPassword,
        });
        if (!isMatch) {
          req.user = null;
          throw new Error("Email address or Password is incorrect");
        }

        if (accountActive !== STATUS.ACTIVE)
          throw new Error("Account Has Been Disabled. Please Contact Admin.");
      }
    }),
];

exports.AdminRegisterValidations = [
  body("fullname").trim().escape(),
  body("email")
    .toLowerCase()
    .trim()
    .escape()
    .custom(async (email) => {
      if (!email.endsWith("@kenecare.com")) {
        throw new Error("Unauthorized email address provider");
      }
      const user = await getAdminByEmail(email);
      if (user) {
        throw new Error("Email already exist");
      }
      return true;
    }),
  body("mobileNumber")
    .notEmpty()
    .withMessage("Mobile Number is required")
    .toLowerCase()
    .matches(/^\+(?:[0-9]?){1,3}[0-9]{6,14}$/)
    .withMessage("Mobile Number must be in international format(e.g +XXX)")
    .isLength({ min: 9, max: 20 })
    .trim()
    .escape()
    .custom(async (mobileNumber) => {
      const user = await getAdminByMobileNumber(mobileNumber);
      if (user) {
        throw new Error("Mobile Number Already Exist");
      }
      return true;
    }),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .matches(/^(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,50}$/)
    .withMessage(
      "Password must be at least 8 characters long, with 1 uppercase letter and 1 special character",
    )
    .trim(),
  body("confirmPassword")
    .notEmpty()
    .withMessage("Confirm Password is required")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Passwords do not match"),
];

exports.AdminUpdateStatusValidations = [
  param("id")
    .notEmpty()
    .withMessage("Account ID is required")
    .trim()
    .escape()
    .isNumeric({ no_symbols: true })
    .custom(async (id, { req }) => {
      const user = await getAdminById(id);
      if (!user) {
        throw new Error("Specified Account Not found");
      }
      req.user = user;
      return true;
    }),
  query("status")
    .notEmpty()
    .withMessage("Status is required")
    .trim()
    .escape()
    .isNumeric({ no_symbols: true }),
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
