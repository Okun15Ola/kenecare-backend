const logger = require("../../middlewares/logger.middleware.js");
const {
  getAllCouncilRegistrations,
  getCouncilRegistration,
  approveCouncilRegistration,
} = require("../../services/doctors.council-registration.services");

exports.GetCouncilRegistrationController = async (req, res, next) => {
  try {
    const response = await getAllCouncilRegistrations();
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
    const userId = parseInt(req.user.id);
    const regId = parseInt(req.params.id);
    const response = await approveCouncilRegistration({
      regId,
      userId,
    });
    return res.status(response.statusCode).json(response);
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
