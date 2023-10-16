const path = require("path");
const router = require("express").Router();
const logger = require("../../middlewares/logger.middleware");
const { validate: Validate } = require("../../validations/validate");
const {
  LoginController,
  RegisterController,
  OTPLoginController,
  VerifyOTPController,
  ForgotPasswordController,
} = require("../../controllers/admin/auth.admin.controller");
const {
  LoginValidations,
  RegisterValidations,
  OTPLoginValidation,
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
router.post("/login", LoginValidations, Validate, LoginController);
router.post("/login/:otp", OTPLoginValidation, Validate, OTPLoginController);
router.post("/register", RegisterValidations, Validate, RegisterController);
router.post("/verify/:otp", VerifyOTPController);
router.post("/forgot-password", ForgotPasswordController);
