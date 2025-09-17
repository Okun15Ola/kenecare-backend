const logger = require("../../middlewares/logger.middleware");
const {
  getTestimonials,
  getTestimonialById,
  approveTestimonialById,
  denyTestimonialById,
} = require("../../services/testimonials.services");

exports.GetTestimonialsController = async (req, res, next) => {
  try {
    const { limit, page } = req.query;
    const response = await getTestimonials(limit, page);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};
exports.GetTestimonialByIDController = async (req, res, next) => {
  try {
    const testimonialId = parseInt(req.params.id, 10);
    const response = await getTestimonialById(testimonialId);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

exports.ApproveTestimonialController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id, 10);
    const testimonialId = parseInt(req.params.id, 10);
    const response = await approveTestimonialById({
      testimonialId,
      approvedBy: userId,
    });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};
exports.DenyTestimonialController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id, 10);
    const testimonialId = parseInt(req.params.id, 10);
    const response = await denyTestimonialById({
      testimonialId,
      approvedBy: userId,
    });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};
exports.DeleteTestimonialByIdController = async (req, res, next) => {
  try {
    return res.sendStatus(200);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};
