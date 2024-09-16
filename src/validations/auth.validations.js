const { body, param } = require("express-validator");
const {
  getUserByMobileNumber,
  getUserByEmail,
  getUserByToken,
} = require("../services/users.service");
const { comparePassword } = require("../utils/auth.utils");
const { STATUS, VERIFICATIONSTATUS, USERTYPE } = require("../utils/enum.utils");
const { getDoctorByUserId } = require("../db/db.doctors");
const { getUserById } = require("../db/db.users");

exports.LoginValidations = [
  body("mobileNumber")
    .notEmpty()
    .withMessage("Mobile Number is required")
    .matches(/^\+(232)?(\d{8})$/)
    .withMessage("Mobile Number must be a registered SL (+232) number")
    .trim()
    .escape()
    .custom(async (mobileNumber, { req }) => {
      const user = await getUserByMobileNumber(mobileNumber);

      if (!user) {
        throw new Error(
          "Mobile Number or Password is incorrect. Please try again",
        );
      }

      const { userId, userType, accountActive } = user;

      if (accountActive !== STATUS.ACTIVE) {
        return Response.UNAUTHORIZED({
          message:
            "Account Suspended. Please contact support for futher instructions",
        });
      }

      if (userType === USERTYPE.DOCTOR) {
        //  get doctor profile
        const doctor = await getDoctorByUserId(userId);
        if (!doctor) {
          throw new Error(
            "Doctor profile not found. Please complete profile setup before logging in",
          );
        }

        const { is_profile_approved: isProfileApproved } = doctor;

        if (!isProfileApproved) {
          throw new Error(
            "Doctor Profile has not been approved. Please contact support",
          );
        }
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
        const { user } = req;

        const isMatch = await comparePassword({
          plainPassword: password,
          hashedPassword: user.password,
        });

        if (!isMatch) {
          req.user = null;
          throw new Error("Mobile Number or Password is incorrect");
        } else {
          const { accountActive } = user;

          if (accountActive !== STATUS.ACTIVE) {
            throw new Error(
              "Account Has Been Disabled. Please Contact Kenecare Support for further instructions.",
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
    .matches(/^\+(232)?(\d{8})$/)
    .withMessage("Mobile Number must be a regsitered SL (+232) number")
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
          throw new Error("Account Not Verified. Please verify and try again");
        }
        if (accountActive !== STATUS.ACTIVE) {
          throw new Error(
            "Account Has Been Disabled. Please Contact Kenecare Support for further instrcutions.",
          );
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
    .matches(/^\+(232)?(\d{8})$/)
    .withMessage("Mobile Number must be a registered SL (+232) number.")
    .trim()
    .escape()
    .custom(async (mobileNumber) => {
      const user = await getUserByMobileNumber(mobileNumber);
      if (user) {
        throw new Error(
          "Mobile Number Already Exist. Please try using a different number",
        );
      }
      return true;
    }),
  body("email")
    .toLowerCase()
    .trim()
    .escape()
    .custom(async (email) => {
      const user = await getUserByEmail(email);
      if (user) {
        throw new Error(
          "Email already exist. Please try using a different email",
        );
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
    .withMessage(
      "Passwords do not match. Ensure password and confirm password are the same.",
    ),
  // body("referralCode").custom((value) => {
  //   console.log("Referral Code: ", value);
  // }),
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
  body("currentPassword")
    .notEmpty()
    .withMessage("Current Password is required")
    .trim()
    .custom(async (value, { req }) => {
      const user = await getUserById(req.user.id);
      if (user) {
        const { password } = user;
        const isMatch = await comparePassword({
          plainPassword: value,
          hashedPassword: password,
        });
        if (!isMatch) {
          throw new Error("Incorrect Current Password");
        }
        req.user = user;
        return true;
      }
      return false;
    }),
  body("newPassword")
    .notEmpty()
    .withMessage("New Password is required")
    .trim()
    .matches(/^(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,50}$/)
    .withMessage(
      "Password must be at least 8 characters long, with 1 uppercase letter and 1 special character",
    ),
  body("confirmNewPassword")
    .trim()
    .custom((value, { req }) => {
      if (value === "") {
        throw new Error("Confirm Password is required");
      } else if (value !== req.body.newPassword) {
        throw new Error("Passwords don't match");
      }
      return true;
    }),
];
