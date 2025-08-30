const Response = require("../../utils/response.utils");
const {
  createAdmin,
  loginAdmin,
  logoutAdmin,
} = require("../../services/admin/admins.services");
const logger = require("../../middlewares/logger.middleware");

exports.AuthenticateController = async (req, res, next) => {
  try {
    return res.sendStatus(200);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};
exports.AdminLoginController = async (req, res, next) => {
  try {
    const admin = req.user;
    const { message, data } = await loginAdmin(admin);
    return res.status(200).json(Response.SUCCESS({ message, data }));
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

exports.AdminLogoutController = async (req, res, next) => {
  try {
    const { token, tokenExpiry } = req;
    const { message, data } = await logoutAdmin({ token, tokenExpiry });
    return res.status(200).json(Response.SUCCESS({ message, data }));
  } catch (error) {
    logger.error(error);
    return next(error);
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
    logger.error(error);
    return next(error);
  }
};

exports.AdminUpdatePasswordController = (req, res, next) => {
  try {
    logger.info("Admin update password");
  } catch (error) {
    logger.error(error);
    next(error);
  }
};
exports.AdminUpdateAccountStatusController = (req, res, next) => {
  try {
    logger.info("Admin update password");
  } catch (error) {
    logger.error(error);
    next(error);
  }
};
