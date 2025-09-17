const {
  registerNewUser,
  verifyRegistrationOTP,
  loginUser,
  logoutUser,
  logoutAllDevices,
  requestUserLoginOtp,
  verifyUserLoginOtp,
  resendVerificationOTP,
  sendForgetPasswordOTP,
  updateUserPassword,
  verifyForgetPasswordOTP,
  updatePushNotificationToken,
} = require("../services/users.service");
const logger = require("../middlewares/logger.middleware");

exports.AuthenticateController = async (req, res, next) => {
  try {
    return res.sendStatus(200);
  } catch (error) {
    logger.error("AuthenticateController ", error);
    return next(error);
  }
};

exports.LoginController = async (req, res, next) => {
  try {
    const response = await loginUser(req.user);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error("LoginController", error);
    return next(error);
  }
};

exports.RequestLoginOTPController = async (req, res, next) => {
  try {
    const response = await requestUserLoginOtp(req.user);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error("RequestLoginOTPController", error);
    return next(error);
  }
};

exports.VerifyLoginOTPController = async (req, res, next) => {
  try {
    const response = await verifyUserLoginOtp(req.user);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error("VerifyLoginOTPController", error);
    return next(error);
  }
};

exports.LogoutController = async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    const { token, tokenExpiry } = req;
    const response = await logoutUser({ userId, token, tokenExpiry });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error("LogoutController", error);
    return next(error);
  }
};

exports.LogoutAllDevicesController = async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    const { token, tokenExpiry } = req;
    const response = await logoutAllDevices({ userId, token, tokenExpiry });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error("LogoutAllDevicesController", error);
    return next(error);
  }
};

exports.RegisterController = async (req, res, next) => {
  try {
    const response = await registerNewUser(req.body);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error("RegisterController", error);
    return next(error);
  }
};

exports.VerifyRegisterOTPController = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { user } = req;
    const response = await verifyRegistrationOTP({ token, user });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error("VerifyRegisterOTPController", error);
    return next(error);
  }
};

exports.ResendVerificationOTPController = async (req, res, next) => {
  try {
    const response = await resendVerificationOTP(req.user);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error("ResendVerificationOTPController", error);
    return next(error);
  }
};

exports.RequestForgotPasswordOTPController = async (req, res, next) => {
  try {
    const response = await sendForgetPasswordOTP(req.user);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error("RequestForgotPasswordOTPController", error);
    return next(error);
  }
};

exports.VerifyForgotPasswordOTPController = async (req, res, next) => {
  try {
    const { token } = req.body;
    const { verificationToken, accountVerified, verificationExpiry } = req.user;
    const response = await verifyForgetPasswordOTP(
      token,
      verificationToken,
      accountVerified,
      verificationExpiry,
    );
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error("VerifyForgotPasswordOTPController", error);
    return next(error);
  }
};

exports.UpdatePasswordController = async (req, res, next) => {
  try {
    const { newPassword } = req.body;
    const { userId, mobileNumber } = req.user;
    const response = await updateUserPassword({
      newPassword,
      userId,
      mobileNumber,
    });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error("UpdatePasswordController", error);
    return next(error);
  }
};

exports.VerifyRequestedOTPController = async (req, res, next) => {
  try {
    const { phoneNumber } = req.body;
    const { user } = req;
    const response = await resendVerificationOTP({ phoneNumber, user });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error("VerifyRequestedOTPController", error);
    return next(error);
  }
};

exports.UpdatePushNotificationTokenController = async (req, res, next) => {
  try {
    const { user } = req;
    const { notification_token: token } = req.body;
    const response = await updatePushNotificationToken({ token, user });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error("UpdatePushNotificationTokenController", error);
    return next(error);
  }
};
