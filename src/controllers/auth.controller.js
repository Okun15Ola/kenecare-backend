const {
  registerNewUser,
  verifyRegistrationOTP,
  loginUser,
  requestUserLoginOtp,
  verifyUserLoginOtp,
  resendVerificationOTP,
  sendVerificationOTP,
  updateUserPassword,
  verifyRequestedOTP,
  updatePushNotificationToken,
} = require("../services/users.service");

const Response = require("../utils/response.utils");
const logger = require("../middlewares/logger.middleware");
const { refineMobileNumber } = require("../utils/auth.utils");

exports.AuthenticateController = async (req, res, next) => {
  try {
    return res.sendStatus(200);
  } catch (error) {
    console.error(error);
    logger.error(error);
    return next(error);
  }
};
exports.LoginController = async (req, res, next) => {
  try {
    const response = await loginUser(req.user);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error("Controller Error: ", error);
    console.error("Controller Error: ", error);
    return next(error);
  }
};
exports.RequestLoginOTPController = async (req, res, next) => {
  try {
    const response = await requestUserLoginOtp(req.user);
    return res.status(response.statusCode).json(Response.SUCCESS(response));
  } catch (error) {
    logger.error(error);
    console.error("Controller Error: ", error);
    return next(error);
  }
};
exports.VerifyLoginOTPController = async (req, res, next) => {
  try {
    const response = await verifyUserLoginOtp(req.user);
    return res.status(response.statusCode).json(Response.SUCCESS(response));
  } catch (error) {
    logger.error(error);
    console.error("Controller Error: ", error);
    return next(error);
  }
};

exports.RegisterController = async (req, res, next) => {
  try {
    const email = req.body.email || "";
    const { mobileNumber, userType, password, referralCode } = req.body;

    const refinedMobileNumber = refineMobileNumber(mobileNumber);
    const response = await registerNewUser({
      mobileNumber: refinedMobileNumber,
      password,
      email,
      userType,
      referralCode: referralCode || null,
    });

    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    console.error("Controller Error: ", error);
    return next(error);
  }
};
exports.VerifyRegisterOTPController = async (req, res, next) => {
  try {
    // Extract token FROM REQUEST
    const { token } = req.params;

    const response = await verifyRegistrationOTP(token);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    console.error("Controller Error: ", error);
    return next(error);
  }
};

exports.RequestForgotPasswordOTPController = async (req, res, next) => {
  try {
    const response = await sendVerificationOTP(req.user);

    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    console.error("Controller Error: ", error);
    return next(error);
  }
};
exports.VerifyForgotPasswordOTPController = async (req, res, next) => {
  try {
    // Forgot Password Controller
    // const { token } = req.body;
    const response = await verifyRequestedOTP(req.user);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    console.error("Controller Error: ", error);
    return next(error);
  }
};
exports.UpdatePasswordController = async (req, res, next) => {
  try {
    const { newPassword } = req.body;
    const { user } = req;
    const response = await updateUserPassword({ newPassword, user });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    console.error("Controller Error: ", error);
    return next(error);
  }
};
exports.ResetPasswordController = async (req, res, next) => {
  try {
    const { newPassword } = req.body;
    const { user } = req;
    const response = await updateUserPassword({ newPassword, user });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    console.error("Controller Error: ", error);
    return next(error);
  }
};

// resend signup OTP
exports.ResendVerificationOTPController = async (req, res, next) => {
  try {
    // const { phoneNumber } = req.body;
    const { user } = req;

    const response = await resendVerificationOTP(user);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    console.error("Controller Error: ", error);
    return next(error);
  }
};

// send verification OTP
exports.SendVerificationOTPController = async (req, res, next) => {
  try {
    const { user } = req;

    const response = await sendVerificationOTP(user);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    return next(error);
  }
};
// VERIFY verification OTP
exports.VerifyRequestedOTPController = async (req, res, next) => {
  try {
    const { phoneNumber } = req.body;
    const { user } = req;

    const response = await resendVerificationOTP({ phoneNumber, user });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    return next(error);
  }
};

exports.UpdatePushNotificationTokenController = async (req, res, next) => {
  try {
    const { user } = req;
    const { notification_token: token } = req.body;
    const response = await updatePushNotificationToken({ user, token });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    return next(error);
  }
};
