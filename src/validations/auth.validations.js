const { body, param } = require("express-validator");
const {
  getUserByMobileNumber,
  getUserByEmail,
  getUserByToken,
} = require("../services/users.service");
const { comparePassword } = require("../utils/auth.utils");
const { STATUS, VERIFICATIONSTATUS } = require("../utils/enum.utils");

exports.LoginValidations = [
  body("mobileNumber")
    .notEmpty()
    .withMessage("Mobile Number is required")
    .matches(/^\+(?:[0-9]?){1,3}[0-9]{6,14}$/)
    .withMessage("Mobile Number must be in international format(e.g +XXX)")
    .trim()
    .escape()
    .custom(async (mobileNumber, { req }) => {
      const user = await getUserByMobileNumber(mobileNumber);

      if (!user) {
        throw new Error("Not A registered Mobile Number");
      }
      req.user = user;
    }),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .trim()
    .escape()
    .custom(async (password, { req }) => {
      if (req.user) {
        const { user } = req;

        const isMatch = await comparePassword({
          plainPassword: password,
          hashedPassword: user.password,
        });

        if (!isMatch) {
          req.user = null;
          throw new Error("Mobile Number or Password is incorrect");
        } else {
          const { accountVerified, accountActive } = user;

          if (accountVerified !== VERIFICATIONSTATUS.VERIFIED) {
            throw new Error("Account Not Verified");
          }
          if (accountActive !== STATUS.ACTIVE) {
            throw new Error(
              "Account Has Been Disabled. Please Contact Support."
            );
          }
        }
      }
    }),
];

exports.OTPLoginValidation = [
  body("mobileNumber")
    .notEmpty()
    .withMessage("Mobile Number is required")
    .matches(/^\+(?:[0-9]?){1,3}[0-9]{6,14}$/)
    .withMessage("Mobile Number must be in international format(e.g +XXX)")
    .trim()
    .escape()
    .custom(async (mobileNumber, { req }) => {
      const user = await getUserByMobileNumber(mobileNumber);

      if (!user) {
        throw new Error("Not A registered Mobile Number");
      }
      if (user) {
        const { accountVerified, accountActive } = user;

        if (accountVerified !== VERIFICATIONSTATUS.VERIFIED) {
          throw new Error("Account Not Verified");
        }
        if (accountActive !== STATUS.ACTIVE) {
          throw new Error("Account Has Been Disabled. Please Contact Support.");
        }
        req.user = user;
      }
    }),
];

exports.RegisterValidations = [
  body("mobileNumber")
    .notEmpty()
    .withMessage("Mobile Number is required")
    .toLowerCase()
    .matches(/^\+(?:[0-9]?){1,3}[0-9]{6,14}$/)
    .withMessage("Mobile Number must be in international format(e.g +XXX)")
    .isLength({ min: 9, max: 20 })
    .trim()
    .escape()
    .custom(async (mobileNumber, { req }) => {
      const user = await getUserByMobileNumber(mobileNumber);
      if (user) {
        throw new Error("Mobile Number Already Exist");
      }
      return true;
    }),
  body("email")
    .toLowerCase()
    .trim()
    .escape()
    .custom(async (email, { req }) => {
      const user = await getUserByEmail(email);
      if (user) {
        throw new Error("Email already exist");
      }
      return true;
    }),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .matches(/^(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,50}$/)
    .withMessage(
      "Password must be at least 8 characters long, with 1 uppercase letter and 1 special character"
    )
    .trim(),
  body("confirmPassword")
    .notEmpty()
    .withMessage("Confirm Password is required")
    .custom((value, { req }) => {
      if (value !== req.body.password) return false;
      return true;
    })
    .withMessage("Passwords do not match"),
];
exports.VerifyTokenValidations = [
  param("token")
    .notEmpty()
    .withMessage("Verification Token is required")
    .isLength({ max: 6, min: 6 })
    .trim()
    .escape()
    .custom(async (token, { req }) => {
      const user = await getUserByToken(token);
      if (!user) {
        throw new Error("Invalid AUTH Token. Please enter a valid AUTH Token");
      }
      req.user = user;
      return true;
    }),
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
