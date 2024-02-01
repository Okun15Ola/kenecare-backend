const logger = require("../../middlewares/logger.middleware.js");
const {
  getCouncilRegistrations,
  getCouncilRegistration,
} = require("../../services/doctors.council-registration.services");

exports.GetCouncilRegistrationController = async (req, res, next) => {
  try {
    const response = await getCouncilRegistrations();
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};

exports.GetCouncilRegistrationByIdController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const response = await getCouncilRegistration(id);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
exports.ApproveCouncilRegistrationController = async (req, res, next) => {
  try {
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};

exports.DenyCouncilRegistrationController = async (req, res, next) => {
  try {
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
