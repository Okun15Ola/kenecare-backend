const router = require("express").Router();
const { Validate } = require("../../validations/validate");
const {
  LoginController,
  RegisterController,
  VerifyRegisterOTPController,
  RequestLoginOTPController,
  VerifyLoginOTPController,
  RequestForgotPasswordOTPController,
  ResendVerificationOTPController,
  // VerifyRequestedOTPController,
  UpdatePasswordController,
  UpdatePushNotificationTokenController,
  VerifyForgotPasswordOTPController,
  AuthenticateController,
  LogoutController,
  LogoutAllDevicesController,
} = require("../../controllers/auth.controller");
const {
  LoginValidations,
  RegisterValidations,
  OTPLoginValidation,
  VerifyTokenValidations,
  UpdatePasswordValidations,
  MobileNumberValidations,
  TokenValidations,
  ResetPasswordValidations,
  NotificationTokenValidations,
} = require("../../validations/auth.validations");
const { authLimiter, otpLimiter } = require("../../utils/rate-limit.utils");
const { authenticateUser } = require("../../middlewares/auth.middleware");

router.get("/authenticate", authenticateUser, AuthenticateController);

router.post("/login", authLimiter, LoginValidations, Validate, LoginController);

router.post("/logout", authenticateUser, LogoutController);

router.post(
  "/logout-all-devices",
  authenticateUser,
  LogoutAllDevicesController,
);

router.post(
  "/login/otp",
  otpLimiter,
  OTPLoginValidation,
  Validate,
  RequestLoginOTPController,
);

router.post(
  "/login/:token",
  authLimiter,
  VerifyTokenValidations,
  Validate,
  VerifyLoginOTPController,
);

router.post(
  "/register",
  authLimiter,
  RegisterValidations,
  Validate,
  RegisterController,
);

router.put(
  "/verify/:token",
  authLimiter,
  VerifyTokenValidations,
  Validate,
  VerifyRegisterOTPController,
);

router.post(
  "/forgot-password",
  otpLimiter,
  MobileNumberValidations,
  Validate,
  RequestForgotPasswordOTPController,
);

router.post(
  "/verify-forgot-password-otp",
  authLimiter,
  TokenValidations,
  Validate,
  VerifyForgotPasswordOTPController,
);

router.post(
  "/otp-resend",
  otpLimiter,
  MobileNumberValidations,
  Validate,
  ResendVerificationOTPController,
);

router.put(
  "/update-password",
  authenticateUser,
  authLimiter,
  UpdatePasswordValidations,
  Validate,
  UpdatePasswordController,
);

router.put(
  "/reset-password",
  authLimiter,
  [...TokenValidations, ...ResetPasswordValidations],
  Validate,
  UpdatePasswordController,
);

// router.post(
//   "/resend-verification-otp",
//   authLimiter,
//   authenticateUser,
//   VerifyRequestedOTPController,
// );

router.put(
  "/notif-token",
  authLimiter,
  authenticateUser,
  NotificationTokenValidations,
  Validate,
  UpdatePushNotificationTokenController,
);

module.exports = router;
