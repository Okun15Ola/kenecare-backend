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
const {
  getUserByMobileNumber,
  getUserByVerificationToken,
} = require("../../db/db.users");

//regex constants
const passwordRegex = /^(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,50}$/;
const phoneNumberRegex = /^\+(232)?(\d{8})$/;

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

router.post(
  "/forgot-password",
  [
    body("phoneNumber")
      .trim()
      .escape()
      .custom(async (value, { req }) => {
        if (value) {
          if (!phoneNumberRegex.test(value)) {
            throw new Error("Invalid number format.");
          }
          const data = await getUserByMobileNumber(value);

          if (!data) {
            throw new Error("Error verifiying phone number");
          }

          req.user = data;
          return true;
        }
      }),
    body("token")
      .trim()
      .escape()
      .custom(async (value, { req }) => {
        if (value) {
          const data = await getUserByVerificationToken(value);

          if (!data) {
            throw new Error(
              "Error verifying token, please try again with a valid token."
            );
          }

          req.user = data;
          return true;
        }
      }),
  ],
  Validate,
  ForgotPasswordController
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
router.put(
  "/reset-password",
  [
    body("token")
      .trim()
      .escape()
      .custom(async (value, { req }) => {
        if (value) {
          const data = await getUserByVerificationToken(value);
          if (!data) {
            throw new Error("Error Resetting password, please try again");
          }

          req.user = data;
          return true;
        }
      }),
    body("newPassword")
      .trim()
      .custom(async (value, { req }) => {
        if (value === "") {
          throw new Error("Password is required");
        }
        if (!passwordRegex.test(value)) {
          throw new Error(
            "Password must be at least 8 characters long, with 1 uppercase letter and 1 special character"
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
  UpdatePasswordController
);
router.post("/otp-request", requireUserAuth, SendVerificationOTPController);
router.post("/otp-request", requireUserAuth, VerifyRequestedOTPController);

module.exports = router;
