const doctorsReviewService = require("../../services/doctors/reviews.services");
const logger = require("../../middlewares/logger.middleware");

exports.getDoctorApprovedReviewsController = async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    const response =
      await doctorsReviewService.getApprovedDoctorReviewsService(userId);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};
