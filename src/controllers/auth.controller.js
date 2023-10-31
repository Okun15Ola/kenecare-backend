const {
  createUser,
  verifyUserAccount,
  loginUser,
  requestUserLoginOtp,
  verifyUserLoginOtp,
} = require("../services/users.service");

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
    const response = await loginUser(req.user);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
exports.RequestLoginOTPController = async (req, res, next) => {
  try {
    const response = await requestUserLoginOtp(req.user);
    return res.status(response.statusCode).json(Response.SUCCESS(response));
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
exports.VerifyLoginOTPController = async (req, res, next) => {
  try {
    const response = await verifyUserLoginOtp(req.user);
    return res.status(response.statusCode).json(Response.SUCCESS(response));
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};

exports.RegisterController = async (req, res, next) => {
  try {
    const email = req.body.email || "";
    const { mobileNumber, userType, password } = req.body;

    const result = await createUser({
      mobileNumber,
      password,
      email,
      userType,
    });

    if (result) {
      return res
        .status(201)
        .json(Response.CREATED({ message: "Account Created Successfully" }));
    }
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
exports.VerifyRegisterOTPController = async (req, res, next) => {
  try {
    //TODO Extract token FROM REQUEST
    const { token } = req.params;

    //TODO VERIFY TOKEN
    const result = await verifyUserAccount(token);
    if (result)
      return res
        .status(200)
        .json(Response.SUCCESS({ message: "Account Verfied Successfully" }));
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};

exports.ForgotPasswordController = async (req, res, next) => {
  try {
    //Forgot Password Controller
    const { otp } = req.params;
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
exports.UpdatePasswordController = async (req, res, next) => {
  try {
    //Update Password Controller
    const { otp } = req.params;
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
