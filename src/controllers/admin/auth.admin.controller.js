const Response = require("../../utils/response.utils");
const { createAdmin, loginAdmin } = require("../../services/admins.services");
const logger = require("../../middlewares/logger.middleware");

exports.AuthenticateController = async (req, res, next) => {
  try {
    return res.sendStatus(200);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
exports.AdminLoginController = async (req, res, next) => {
  try {
    const admin = req.user;
    const { message, data } = await loginAdmin(admin);
    return res.status(200).json(Response.SUCCESS({ message, data }));
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};

exports.AdminRegisterController = async (req, res, next) => {
  try {
    const { fullname, email, mobileNumber, password } = req.body;

    const { message, data } = await createAdmin({
      fullname,
      email,
      mobileNumber,
      password,
    });

    return res.status(201).json(Response.CREATED({ message, data }));
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};

exports.AdminUpdatePasswordController = (req, res, next) => {
  try {
    //Update Password Controller
    const { otp } = req.params;
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
exports.AdminUpdateAccountStatusController = (req, res, next) => {
  try {
    //Update Password Controller
    console.log("update account status");
    console.log(req.params);
    console.log(req.query);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
