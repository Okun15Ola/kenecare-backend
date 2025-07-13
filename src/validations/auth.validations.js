const { body, param } = require("express-validator");
const {
  getUserByMobileNumber,
  getUserByEmail,
  getUserById,
  getUserByToken,
} = require("../services/users.service");
const {
  comparePassword,
  refineMobileNumber,
  validateExpoToken,
} = require("../utils/auth.utils");
const { STATUS, VERIFICATIONSTATUS, USERTYPE } = require("../utils/enum.utils");
const { getDoctorByUserId } = require("../repository/doctors.repository");
const {
  getMarketerByReferralCode,
} = require("../repository/marketers.repository");

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,50}$/;

exports.LoginValidations = [
  body("mobileNumber")
    .notEmpty()
    .withMessage("Mobile Number is required")
    .bail()
    .trim()
    .escape()
    .custom(async (mobileNumber, { req }) => {
      const refinedMobileNumber = refineMobileNumber(mobileNumber);

      const user = await getUserByMobileNumber(refinedMobileNumber);

      if (!user) {
        throw new Error(
          "Mobile Number or Password is incorrect. Please try again",
        );
      }

      const { userId, userType, accountActive, accountVerified } = user;

      if (accountActive !== STATUS.ACTIVE) {
        throw new Error(
          "Account Suspended. Please Contact Kenecare Support for further instrcutions.",
        );
      }

      if (accountVerified !== STATUS.ACTIVE) {
        throw new Error(
          "Account has not been verified. Please Verify account and try again",
        );
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
    .bail()
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
    .bail()
    .isMobilePhone()
    .withMessage("Not a valid phone number")
    .bail()
    .trim()
    .escape()
    .custom(async (mobileNumber, { req }) => {
      const refinedMobileNumber = refineMobileNumber(mobileNumber);
      const user = await getUserByMobileNumber(refinedMobileNumber);

      if (!user) {
        throw new Error("Not A registered Mobile Number");
      }
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
    }),
];

exports.RegisterValidations = [
  body("mobileNumber")
    .notEmpty()
    .withMessage("Mobile Number is required")
    .bail()
    .isMobilePhone()
    .withMessage("Not a valid phone number")
    .bail()
    .trim()
    .escape()
    .custom(async (mobileNumber) => {
      const refinedMobileNumber = refineMobileNumber(mobileNumber);
      const user = await getUserByMobileNumber(refinedMobileNumber);
      if (user.statusCode === 200) {
        throw new Error(
          "Mobile Number Already Exist. Please try using a different number",
        );
      }

      return true;
    }),
  body("email")
    .optional()
    .toLowerCase()
    .isEmail()
    .withMessage("Invalid Email Address")
    .bail()
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
    .bail()
    .custom((value, { req }) => value === req.body.password)
    .withMessage(
      "Passwords do not match. Ensure password and confirm password are the same.",
    ),
  body("userType")
    .notEmpty()
    .withMessage("User Type is required")
    .bail()
    .isIn(["patient", "doctor"])
    .withMessage("User Type must be one of 'doctor' or 'patient'"),
  body("referralCode")
    .optional()
    .trim()
    .escape()
    .toUpperCase()
    .isLength({ max: 15, min: 0 })
    .withMessage("Not a valid referral code")
    .custom(async (value) => {
      if (!value) return true;

      const data = await getMarketerByReferralCode(value);
      if (!data) {
        throw new Error(
          "Invalid Referral Code. Try again with a valid referral codeee",
        );
      }
      const {
        is_phone_verified: marketerPhoneVerified,
        is_email_verified: marketerEmailVerified,
      } = data;
      if (!marketerPhoneVerified && !marketerEmailVerified) {
        throw new Error(
          "Invalid Referral Code. Try again with a valid referral code",
        );
      }
      return true;
    }),
];

exports.VerifyTokenValidations = [
  param("token")
    .notEmpty()
    .withMessage("Verification Token is required")
    .bail()
    .isLength({ max: 6, min: 6 })
    .withMessage("Verification Token must be 6 digit long")
    .bail()
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
  body("token")
    .notEmpty()
    .withMessage("Token is required")
    .bail()
    .trim()
    .escape()
    .custom(async (value, { req }) => {
      const user = await getUserByToken(value);
      if (!user) {
        throw new Error(
          "Invalid or expired token. Please try again with a valid token.",
        );
      }

      req.user = user;
      return true;
    }),
  body("currentPassword")
    .notEmpty()
    .withMessage("Current Password is required")
    .trim()
    .custom(async (currentPassword, { req }) => {
      const user = await getUserById(req.user.id);
      if (!user) {
        throw new Error("User not found");
      }

      const isMatch = await comparePassword({
        plainPassword: currentPassword,
        hashedPassword: user.password,
      });

      if (!isMatch) {
        throw new Error("Current password is incorrect");
      }

      req.user = user;
      return true;
    }),
  body("newPassword")
    .notEmpty()
    .withMessage("New Password is required")
    .bail()
    .isLength({ min: 8, max: 50 })
    .withMessage("New password must be between 8 and 50 characters")
    .bail()
    .trim()
    .matches(/^(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,50}$/)
    .withMessage(
      "Password must be at least 8 characters long, with 1 uppercase letter and 1 special character",
    )
    .custom((newPassword, { req }) => {
      if (newPassword === req.body.currentPassword) {
        throw new Error(
          "New password must be different from the current password",
        );
      }
      return true;
    }),
  body("confirmNewPassword")
    .notEmpty()
    .withMessage("Confirm New Password is required")
    .bail()
    .trim()
    .custom((confirmNewPassword, { req }) => {
      if (confirmNewPassword !== req.body.newPassword) {
        throw new Error(
          "Confirmation password does not match the new password",
        );
      }
      return true;
    }),
];

exports.MobileNumberValidations = [
  body("phoneNumber")
    .notEmpty()
    .withMessage("Phone Number is required")
    .bail()
    .trim()
    .escape()
    .custom(async (phoneNumber, { req }) => {
      const refinedMobileNumber = refineMobileNumber(phoneNumber);
      const user = await getUserByMobileNumber(refinedMobileNumber);

      if (!user) {
        throw new Error(
          "No Account associated with the phone number you provided",
        );
      }

      req.user = user;
      return true;
    }),
];

exports.TokenValidations = [
  body("token")
    .notEmpty()
    .withMessage("Token is required")
    .bail()
    .trim()
    .escape()
    .custom(async (value, { req }) => {
      const user = await getUserByToken(value);
      if (!user) {
        throw new Error(
          "Invalid or expired token. Please try again with a valid token.",
        );
      }

      req.user = user;
      return true;
    }),
];

exports.ResetPasswordValidations = [
  body("newPassword")
    .notEmpty()
    .withMessage("Password is required")
    .bail()
    .isLength({ min: 8, max: 50 })
    .withMessage("Password must be at least 8 characters long")
    .bail()
    .trim()
    .custom(async (value) => {
      if (!PASSWORD_REGEX.test(value)) {
        throw new Error(
          "Password must be at least 8 characters long, with 1 uppercase letter and 1 special character",
        );
      }
    }),
  body("confirmNewPassword")
    .notEmpty()
    .withMessage("Confirm Password is required")
    .bail()
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("Passwords does'nt match");
      }
      return true;
    }),
];

exports.NotificationTokenValidations = [
  body("notification_token")
    .notEmpty()
    .withMessage("Push notification token is required")
    .custom(async (value) => {
      const isValidToken = validateExpoToken(value);

      if (!isValidToken) {
        throw new Error(
          "Invalid Expo Notification Token. Please try again with a valid token.",
        );
      }
      return true;
    }),
];
