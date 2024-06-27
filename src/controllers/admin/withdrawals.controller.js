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
    return next(error);
  }
};
exports.GetWithdrawalRequestByIdController = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const response = await getRequestById(id);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    return next(error);
  }
};
exports.ApproveWithdrawalRequestController = async (req, res, next) => {
  try {
    const requestId = parseInt(req.params.id, 10);
    const userId = parseInt(req.user.id, 10);
    const { comment } = req.body;
    const response = await approveRequest({ requestId, userId, comment });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    return next(error);
  }
};

exports.DenyWithdrawalRequestController = async (req, res, next) => {
  try {
    const requestId = parseInt(req.params.id, 10);
    const userId = parseInt(req.user.id, 10);
    const { comment } = req.body;
    const response = await denyRequest({ userId, requestId, comment });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    return next(error);
  }
};
