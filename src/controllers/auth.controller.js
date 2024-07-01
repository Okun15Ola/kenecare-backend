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

exports.AuthenticateController = async (req, res, next) => {
  try {
    // Authenticate Controller
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
    logger.info("hello");
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error("Error Logging In: ", error);
    return next(error);
  }
};
exports.RequestLoginOTPController = async (req, res, next) => {
  try {
    const response = await requestUserLoginOtp(req.user);
    return res.status(response.statusCode).json(Response.SUCCESS(response));
  } catch (error) {
    console.error(error);
    logger.error(error);
    return next(error);
  }
};
exports.VerifyLoginOTPController = async (req, res, next) => {
  try {
    const response = await verifyUserLoginOtp(req.user);
    return res.status(response.statusCode).json(Response.SUCCESS(response));
  } catch (error) {
    console.error(error);
    logger.error(error);
    return next(error);
  }
};

exports.RegisterController = async (req, res, next) => {
  try {
    const email = req.body.email || "";
    const { mobileNumber, userType, password } = req.body;

    const response = await registerNewUser({
      mobileNumber,
      password,
      email,
      userType,
    });

    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    return next(error);
  }
};
exports.VerifyRegisterOTPController = async (req, res, next) => {
  try {
    // Extract token FROM REQUEST
    const { token } = req.params;
    const { user } = req;
    const response = await verifyRegistrationOTP({ token, user });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    return next(error);
  }
};

exports.ForgotPasswordController = async (req, res, next) => {
  try {
    // Forgot Password Controller
    const { phoneNumber, token } = req.body;
    let response = null;
    if (phoneNumber) {
      response = await sendVerificationOTP(req.user);
    }
    if (token) {
      response = await verifyRequestedOTP(req.user);
    }

    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
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
    console.error(error);
    logger.error(error);
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
    console.error(error);
    logger.error(error);
    return next(error);
  }
};

// resend signup OTP
exports.ResendVerificationOTPController = async (req, res, next) => {
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
