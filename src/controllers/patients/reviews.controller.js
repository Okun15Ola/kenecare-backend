const doctorsReviewService = require("../../services/patients/reviews.services");
const logger = require("../../middlewares/logger.middleware");

exports.addDoctorsReviewsController = async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    const { doctorId, review } = req.body;
    const response = await doctorsReviewService.addDoctorReviewService(
      userId,
      doctorId,
      review,
    );
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

exports.getPatientDoctorsReviewsController = async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    const response =
      await doctorsReviewService.getPatientReviewsService(userId);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};
