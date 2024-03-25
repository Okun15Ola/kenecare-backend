const logger = require("../../middlewares/logger.middleware");
const {
  getAllRequests,
  getRequestById,
  approveRequest,
  denyRequest,
} = require("../../services/admin/withdrawals.services");

exports.GetAllWithdrawalRequestsController = async (req, res, next) => {
  try {
    const response = await getAllRequests();
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
exports.GetWithdrawalRequestByIdController = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const response = await getRequestById(id);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
exports.ApproveWithdrawalRequestController = async (req, res, next) => {
  try {
    const requestId = parseInt(req.params.id);
    const { comment } = req.body;
    const userId = parseInt(req.user.id);
    const response = await approveRequest({ requestId, userId, comment });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};

exports.DenyWithdrawalRequestController = async (req, res, next) => {
  try {
    const requestId = parseInt(req.params.id);
    const { comment } = req.body;
    const userId = parseInt(req.user.id);
    const response = await denyRequest({ userId, requestId, comment });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
