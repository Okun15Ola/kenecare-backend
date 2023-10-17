const router = require("express").Router();
const logger = require("../../middlewares/logger.middleware");
const { Validate } = require("../../validations/validate");
const {
  LoginController,
  RegisterController,
  VerifyRegisterOTPController,
  RequestLoginOTPController,
  VerifyLoginOTPController,
  ForgotPasswordController,
} = require("../../controllers/auth.controller");
const {
  LoginValidations,
  RegisterValidations,
  OTPLoginValidation,
  VerifyTokenValidations,
} = require("../../validations/auth.validations");

router.get("/authenticate", (req, res, next) => {
  try {
    console.log("Authenticated");
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
});

//hanles user login with mobileNumber and Password
router.post("/login", LoginValidations, Validate, LoginController);
//request login otp to user and send SMS with OTP
router.post(
  "/login/otp",
  OTPLoginValidation,
  Validate,
  RequestLoginOTPController
);
//Verify login otp sent by the user and generate access token
router.post(
  "/login/:token",
  VerifyTokenValidations,
  Validate,
  VerifyLoginOTPController
);

//handles user register
router.post("/register", RegisterValidations, Validate, RegisterController);
//handles verify user registration token
router.put(
  "/verify/:token",
  VerifyTokenValidations,
  Validate,
  VerifyRegisterOTPController
);
router.post("/forgot-password", ForgotPasswordController);

module.exports = router;
