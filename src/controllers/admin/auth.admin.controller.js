const {
  getUserByEmail,
  getUserByMobileNumber,
} = require("../services/users.service");

const bcryptjs = require("bcryptjs");
const Response = require("../utils/response.utils");
const logger = require("../middlewares/logger.middleware");

exports.AuthenticateController = async (req, res, next) => {
  try {
    //Authenticate Controller
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
exports.LoginController = async (req, res, next) => {
  try {
    //Login Controller
    const { mobileNumber, password } = req.body;
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
exports.OTPLoginController = async (req, res, next) => {
  try {
    //OTP Login Controller
    const { mobileNumber, password } = req.body;
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};

exports.RegisterController = async (req, res, next) => {
  try {
    const { name, mobileNumber, password } = req.body;

    //TODO Check if mobile number exists

    //TODO Check if email exists

    //TODO hash password

    //TODO Save to database

    //TODO Send verification OTP (sms/email)

    //TODO Send success response
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};

exports.VerifyOTPController = (req, res, next) => {
  try {
    //Verify OTP Controller
    const { otp } = req.params;
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
exports.ForgotPasswordController = (req, res, next) => {
  try {
    //Forgot Password Controller
    const { otp } = req.params;
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
exports.UpdatePasswordController = (req, res, next) => {
  try {
    //Update Password Controller
    const { otp } = req.params;
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
