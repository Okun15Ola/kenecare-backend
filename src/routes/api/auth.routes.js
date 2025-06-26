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
  SendVerificationOTPController,
  VerifyRequestedOTPController,
  UpdatePasswordController,
  UpdatePushNotificationTokenController,
  VerifyForgotPasswordOTPController,
  AuthenticateController,
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
const { requireUserAuth } = require("../../middlewares/auth.middleware");

router.get("/authenticate", requireUserAuth, AuthenticateController);

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
  MobileNumberValidations,
  Validate,
  RequestForgotPasswordOTPController,
);

router.post(
  "/verify-forgot-password-otp",
  TokenValidations,
  Validate,
  VerifyForgotPasswordOTPController,
);

router.post(
  "/otp-resend",
  MobileNumberValidations,
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
  [...TokenValidations, ...ResetPasswordValidations],
  Validate,
  UpdatePasswordController,
);
router.post("/otp-request", requireUserAuth, SendVerificationOTPController);
router.post("/otp-request", requireUserAuth, VerifyRequestedOTPController);

router.put(
  "/notif-token",
  requireUserAuth,
  NotificationTokenValidations,
  Validate,
  UpdatePushNotificationTokenController,
);

module.exports = router;
