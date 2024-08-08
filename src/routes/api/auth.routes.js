const router = require("express").Router();
const { body } = require("express-validator");
const logger = require("../../middlewares/logger.middleware");
const { Validate } = require("../../validations/validate");
const {
  LoginController,
  RegisterController,
  VerifyRegisterOTPController,
  RequestLoginOTPController,
  VerifyLoginOTPController,
  RequestForgotPasswordOTPController,
  ResendVerificationOTPController,
  SendVerificationOTPController,
  VerifyRequestedOTPController,
  UpdatePasswordController,
  UpdatePushNotificationTokenController,
  VerifyForgotPasswordOTPController,
} = require("../../controllers/auth.controller");
const {
  LoginValidations,
  RegisterValidations,
  OTPLoginValidation,
  VerifyTokenValidations,
  UpdatePasswordValidations,
} = require("../../validations/auth.validations");
const { requireUserAuth } = require("../../middlewares/auth.middleware");
const {
  getUserByMobileNumber,
  getUserByVerificationToken,
} = require("../../db/db.users");
const { validateExpoToken } = require("../../utils/auth.utils");
const { limiter } = require("../../utils/rate-limit.utils");
// regex constants
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,50}$/;
const PHONE_NUMBER_REGEX = /^\+(232)?(\d{8})$/;

limiter(router);
router.get("/authenticate", requireUserAuth, (req, res, next) => {
  try {
    return res.sendStatus(200);
  } catch (error) {
    console.error(error);
    logger.error(error);
    return next(error);
  }
});

router.post("/login", LoginValidations, Validate, LoginController);

router.post(
  "/login/otp",
  OTPLoginValidation,
  Validate,
  RequestLoginOTPController,
);

router.post(
  "/login/:token",
  VerifyTokenValidations,
  Validate,
  VerifyLoginOTPController,
);

router.post("/register", RegisterValidations, Validate, RegisterController);

router.put(
  "/verify/:token",
  VerifyTokenValidations,
  Validate,
  VerifyRegisterOTPController,
);

router.post(
  "/forgot-password",
  [
    body("phoneNumber")
      .trim()
      .escape()
      .custom(async (value, { req }) => {
        if (!value) {
          throw new Error("Phone Number is required");
        }
        if (!PHONE_NUMBER_REGEX.test(value)) {
          throw new Error("Invalid number format.");
        }
        const user = await getUserByMobileNumber(value);

        if (!user) {
          throw new Error("Error verifiying phone number");
        }

        req.user = user;
        return true;
      }),
  ],
  Validate,
  RequestForgotPasswordOTPController,
);

router.post(
  "/verify-forgot-password-otp",
  [
    body("token")
      .trim()
      .escape()
      .custom(async (value, { req }) => {
        if (!value) {
          throw new Error("Token is required");
        }
        const user = await getUserByVerificationToken(value);

        if (!user) {
          throw new Error(
            "Error verifying token, please try again with a valid token.",
          );
        }

        req.user = user;
        return true;
      }),
  ],
  Validate,
  VerifyForgotPasswordOTPController,
);

router.post(
  "/otp-resend",
  [
    body("phoneNumber")
      .notEmpty()
      .withMessage("Phone Number is required")
      .trim()
      .escape()
      .custom(async (value, { req }) => {
        const data = await getUserByMobileNumber(value);

        if (!data) {
          throw new Error(
            "BAD_REQUEST. Error Resending OTP. Please check mobile number",
          );
        }

        req.user = data;
        return true;
      }),
  ],
  Validate,
  ResendVerificationOTPController,
);
router.put(
  "/update-password",
  requireUserAuth,
  UpdatePasswordValidations,
  Validate,
  UpdatePasswordController,
);
router.put(
  "/reset-password",
  [
    body("token")
      .trim()
      .escape()
      .custom(async (value, { req }) => {
        if (!value) {
          throw new Error("Token is required");
        }
        const data = await getUserByVerificationToken(value);
        if (!data) {
          throw new Error("Error Resetting password, please try again");
        }

        req.user = data;
        return true;
      }),
    body("newPassword")
      .trim()
      .custom(async (value) => {
        if (value === "") {
          throw new Error("Password is required");
        }
        if (!PASSWORD_REGEX.test(value)) {
          throw new Error(
            "Password must be at least 8 characters long, with 1 uppercase letter and 1 special character",
          );
        }
      }),
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
  ],
  Validate,
  UpdatePasswordController,
);
router.post("/otp-request", requireUserAuth, SendVerificationOTPController);
router.post("/otp-request", requireUserAuth, VerifyRequestedOTPController);

router.put(
  "/notif-token",
  requireUserAuth,
  [
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
  ],
  Validate,
  UpdatePushNotificationTokenController,
);

module.exports = router;
