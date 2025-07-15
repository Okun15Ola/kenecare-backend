const logger = require("../../middlewares/logger.middleware");

const {
  getAllCouncilRegistrations,
  getCouncilRegistration,
  approveCouncilRegistration,
  rejectCouncilRegistration,
} = require("../../services/admin/doctor-council-registration.services");

exports.GetCouncilRegistrationController = async (req, res, next) => {
  try {
    const {
      pagination: { limit, offset },
      paginationInfo,
    } = req;
    const response = await getAllCouncilRegistrations(
      limit,
      offset,
      paginationInfo,
    );
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

exports.GetCouncilRegistrationByIdController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const response = await getCouncilRegistration(id);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};
exports.ApproveCouncilRegistrationController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id, 10);
    const regId = parseInt(req.params.id, 10);
    const response = await approveCouncilRegistration({
      regId,
      userId,
    });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

exports.RejectCouncilRegistrationController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id, 10);
    const regId = parseInt(req.params.id, 10);
    const { rejectionReason } = req.body;

    const response = await rejectCouncilRegistration({
      rejectionReason,
      regId,
      userId,
    });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};
