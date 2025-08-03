/* eslint-disable import/no-unresolved */
const { body, param } = require("express-validator");
const { mapUserRow, mapDoctorRow } = require("@utils/db-mapper.utils");
const {
  getUserByMobileNumber,
  getUserByEmail,
  getUserById,
  getUserByVerificationToken,
} = require("../repository/users.repository");

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

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,50}$/;

exports.LoginValidations = [
  body("mobileNumber")
    .notEmpty()
    .withMessage("Mobile Number is required")
    .bail()
    .trim()
    .escape()
    .custom(async (mobileNumber, { req }) => {
      const refinedMobileNumber = refineMobileNumber(mobileNumber);

      const dbUser = await getUserByMobileNumber(refinedMobileNumber);

      if (!dbUser) {
        throw new Error(
          "Mobile Number or Password is incorrect. Please try again",
        );
      }

      const user = mapUserRow(dbUser, true);

      const { userId, userType, accountActive, accountVerified } = user;

      if (accountActive !== STATUS.ACTIVE) {
        throw new Error(
          "Unable to access account. Please Contact Kenecare Support for further instrcutions.",
        );
      }

      if (accountVerified !== STATUS.ACTIVE) {
        throw new Error(
          "Account has not been verified. Please Verify account and try again",
        );
      }

      if (userType === USERTYPE.DOCTOR) {
        //  get doctor profile
        const dbDoctor = await getDoctorByUserId(userId);

        if (!dbDoctor) {
          throw new Error(
            "Doctor profile not found. Please complete profile setup before logging in",
          );
        }

        const doctor = await mapDoctorRow(dbDoctor);

        const { isProfileApproved } = doctor;

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
              "Unable to access account. Please Contact Kenecare Support for further instrcutions.",
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
      const dbUser = await getUserByMobileNumber(refinedMobileNumber);

      if (!dbUser) {
        throw new Error(
          "Mobile Number or Password is incorrect. Please try again",
        );
      }

      const user = mapUserRow(dbUser, false, false, true, true);
      const { accountVerified, accountActive, userType, userId } = user;

      if (accountVerified !== VERIFICATIONSTATUS.VERIFIED) {
        throw new Error("Account Not Verified. Please verify and try again");
      }
      if (accountActive !== STATUS.ACTIVE) {
        throw new Error(
          "Unable to access account. Please Contact Kenecare Support for further instrcutions.",
        );
      }

      if (userType === USERTYPE.DOCTOR) {
        const dbDoctor = await getDoctorByUserId(userId);

        if (!dbDoctor) {
          throw new Error(
            "Doctor profile not found. Please complete profile setup before logging in",
          );
        }

        const doctor = await mapDoctorRow(dbDoctor);

        const { isProfileApproved } = doctor;

        if (!isProfileApproved) {
          throw new Error(
            "Doctor Profile has not been approved. Please contact support",
          );
        }
      }

      req.user = user;
      return true;
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
    .custom(async (value) => {
      const refinedMobileNumber = refineMobileNumber(value);
      const dbUser = await getUserByMobileNumber(refinedMobileNumber);

      if (dbUser) {
        const user = mapUserRow(dbUser, false, true, true, true);
        if (user && user.mobileNumber === refinedMobileNumber) {
          throw new Error(
            "Mobile Number Already Exist. Please try using a different number",
          );
        }
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
      if (user && user.email === email) {
        throw new Error(
          "Email already exist. Please try using a different email",
        );
      }
      return true;
    }),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .matches(PASSWORD_REGEX)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character, and be 8-50 characters long",
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
          "Invalid Referral Code. Try again with a valid referral code",
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
      const dbUser = await getUserByVerificationToken(token);
      if (!dbUser) {
        throw new Error("Invalid AUTH Token. Please enter a valid AUTH Token");
      }

      const user = mapUserRow(dbUser, false, false, true, true);

      const { verificationToken, accountVerified, accountActive } = user;

      if (token !== verificationToken) {
        throw new Error(
          "Invalid OTP Code. Please enter a valid OTP to continue.",
        );
      }

      if (accountActive !== STATUS.ACTIVE) {
        throw new Error(
          "Unable to access account. Please Contact Kenecare Support for further instrcutions.",
        );
      }

      if (accountVerified !== STATUS.ACTIVE) {
        throw new Error(
          "Account has not been verified. Please Verify account and try again",
        );
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
      const dbUser = await getUserByVerificationToken(value);
      if (!dbUser) {
        throw new Error(
          "Invalid or expired token. Please try again with a valid token.",
        );
      }

      const user = mapUserRow(dbUser, true, false, true, true);

      const { verificationToken, accountVerified, accountActive } = user;

      if (value !== verificationToken) {
        throw new Error(
          "Invalid OTP Code. Please enter a valid OTP to continue.",
        );
      }

      if (accountActive !== STATUS.ACTIVE) {
        throw new Error(
          "Unable to access account. Please Contact Kenecare Support for further instrcutions.",
        );
      }

      if (accountVerified !== STATUS.ACTIVE) {
        throw new Error(
          "Account has not been verified. Please Verify account and try again",
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
      const dbUser = await getUserById(req.user.userId);
      if (!dbUser) {
        throw new Error("User not found");
      }

      const user = mapUserRow(dbUser, true, false, true, true);

      const isMatch = await comparePassword({
        plainPassword: currentPassword,
        hashedPassword: user.password,
      });

      if (!isMatch) {
        throw new Error("Current password mismatched");
      }

      req.user = user;
      return true;
    }),
  body("newPassword")
    .notEmpty()
    .withMessage("New Password is required")
    .matches(PASSWORD_REGEX)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character, and be 8-50 characters long",
    )
    .trim()
    .custom(async (newPassword, { req }) => {
      const { user } = req;
      const isMatch = await comparePassword({
        plainPassword: newPassword,
        hashedPassword: user.password,
      });
      if (isMatch) {
        throw new Error(
          "New password must be different from previous password",
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
      const dbUser = await getUserByMobileNumber(refinedMobileNumber);

      if (!dbUser) {
        throw new Error(
          "No Account associated with the phone number you provided",
        );
      }

      const user = mapUserRow(dbUser, false, false, true, true);

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
      const dbUser = await getUserByVerificationToken(value);
      if (!dbUser) {
        throw new Error(
          "Invalid or expired token. Please try again with a valid token.",
        );
      }

      const user = mapUserRow(dbUser, false, false, true, true);

      const { verificationToken, accountVerified, accountActive } = user;

      if (value !== verificationToken) {
        throw new Error(
          "Invalid OTP Code. Please enter a valid OTP to continue.",
        );
      }

      if (accountActive !== STATUS.ACTIVE) {
        throw new Error(
          "Unable to access account. Please Contact Kenecare Support for further instrcutions.",
        );
      }

      if (accountVerified !== STATUS.ACTIVE) {
        throw new Error(
          "Account has not been verified. Please Verify account and try again",
        );
      }

      req.user = user;
      return true;
    }),
];

exports.ResetPasswordValidations = [
  body("token")
    .notEmpty()
    .withMessage("Token is required")
    .bail()
    .trim()
    .escape()
    .custom(async (value, { req }) => {
      const dbUser = await getUserByVerificationToken(value);
      if (!dbUser) {
        throw new Error(
          "Invalid or expired token. Please try again with a valid token.",
        );
      }

      const user = mapUserRow(dbUser, true, false, true, true);

      const { verificationToken, accountVerified, accountActive } = user;

      if (value !== verificationToken) {
        throw new Error(
          "Invalid OTP Code. Please enter a valid OTP to continue.",
        );
      }

      if (accountActive !== STATUS.ACTIVE) {
        throw new Error(
          "Unable to access account. Please Contact Kenecare Support for further instrcutions.",
        );
      }

      if (accountVerified !== STATUS.ACTIVE) {
        throw new Error(
          "Account has not been verified. Please Verify account and try again",
        );
      }

      req.user = user;
      return true;
    }),
  body("newPassword")
    .notEmpty()
    .withMessage("New Password is required")
    .matches(PASSWORD_REGEX)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character, and be 8-50 characters long",
    )
    .trim()
    .custom(async (newPassword, { req }) => {
      if (!req.user) {
        return false;
      }
      const { user } = req;
      const isMatch = await comparePassword({
        plainPassword: newPassword,
        hashedPassword: user.password,
      });
      if (isMatch) {
        throw new Error(
          "New password must be different from previous password",
        );
      }
      return true;
    }),
  body("confirmNewPassword")
    .notEmpty()
    .withMessage("Confirm Password is required")
    .bail()
    .trim()
    .custom((value, { req }) => {
      if (!req.user) {
        return false;
      }
      if (value !== req.body.newPassword) {
        throw new Error("Passwords don't match.");
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
