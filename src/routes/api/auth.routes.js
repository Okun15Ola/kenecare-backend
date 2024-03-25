const router = require("express").Router();
const logger = require("../../middlewares/logger.middleware");
const rateLimit = require("../../utils/rate-limit.utils");
const { Validate } = require("../../validations/validate");
const {
  LoginController,
  RegisterController,
  VerifyRegisterOTPController,
  RequestLoginOTPController,
  VerifyLoginOTPController,
  ForgotPasswordController,
  ResendVerificationOTPController,
  SendVerificationOTPController,
  VerifyRequestedOTPController,
  UpdatePasswordController,
} = require("../../controllers/auth.controller");
const {
  LoginValidations,
  RegisterValidations,
  OTPLoginValidation,
  VerifyTokenValidations,
  UpdatePasswordValidations,
} = require("../../validations/auth.validations");
const { requireUserAuth } = require("../../middlewares/auth.middleware");
const { body } = require("express-validator");
const { getUserByMobileNumber } = require("../../db/db.users");

// rateLimit(router);

router.get("/authenticate", requireUserAuth, (req, res, next) => {
  try {
    return res.sendStatus(200);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
});

router.post("/login", LoginValidations, Validate, LoginController);

router.post(
  "/login/otp",
  OTPLoginValidation,
  Validate,
  RequestLoginOTPController
);

router.post(
  "/login/:token",
  VerifyTokenValidations,
  Validate,
  VerifyLoginOTPController
);

router.post("/register", RegisterValidations, Validate, RegisterController);

router.put(
  "/verify/:token",
  VerifyTokenValidations,
  Validate,
  VerifyRegisterOTPController
);

router.post("/forgot-password", ForgotPasswordController);

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
            "BAD_REQUEST. Error Resending OTP. Please check mobile number"
          );
        }

        req.user = data;
        return true;
      }),
  ],
  Validate,
  ResendVerificationOTPController
);
router.put(
  "/update-password",
  requireUserAuth,
  UpdatePasswordValidations,
  Validate,
  UpdatePasswordController
);
router.post("/otp-request", requireUserAuth, SendVerificationOTPController);
router.post("/otp-request", requireUserAuth, VerifyRequestedOTPController);

module.exports = router;
