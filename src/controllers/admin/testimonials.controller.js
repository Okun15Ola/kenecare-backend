const logger = require("../../middlewares/logger.middleware");
const {
  getTestimonials,
  getTestimonialById,
  createTestimonial,
  approveTestimonialById,
  denyTestimonialById,
} = require("../../services/testimonials.services");

exports.GetTestimonialsController = async (req, res, next) => {
  try {
    const {
      pagination: { limit, offset },
      paginationInfo,
    } = req;
    const response = await getTestimonials(limit, offset, paginationInfo);
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
exports.CreateTestimonialController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id, 10);
    const { patientId, content } = req.body;
    const response = await createTestimonial({
      userId,
      patientId,
      content,
    });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

exports.UpdateTestimonialByIdController = async (req, res, next) => {
  try {
    return res.sendStatus(200);
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
