const doctorsReviewService = require("../../services/admin/doctor.reviews.services");
const logger = require("../../middlewares/logger.middleware");
const { STATUS } = require("../../utils/enum.utils");

exports.getDoctorsReviewsController = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const response = await doctorsReviewService.getAllDoctorReviewsService(
      page,
      limit,
    );
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

exports.getDoctorsReviewByIdController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const response = await doctorsReviewService.getReviewByIdService(id);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

exports.approveDoctorReviewController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const response =
      await doctorsReviewService.updateDoctorReviewApprovalStatusService(
        id,
        STATUS.ACTIVE,
      );
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

exports.rejectDoctorReviewController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const response =
      await doctorsReviewService.updateDoctorReviewApprovalStatusService(
        id,
        STATUS.NOT_ACTIVE,
      );
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};
