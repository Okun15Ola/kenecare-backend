const Response = require("../../utils/response.utils");
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
    const response = await getTestimonials();
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
exports.GetTestimonialByIDController = async (req, res, next) => {
  try {
    const testimonialId = parseInt(req.params.id);
    const response = await getTestimonialById(testimonialId);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};

exports.ApproveTestimonialController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id);
    const testimonialId = parseInt(req.params.id);
    const response = await approveTestimonialById({
      testimonialId,
      approvedBy: userId,
    });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
exports.DenyTestimonialController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id);
    const testimonialId = parseInt(req.params.id);
    const response = await denyTestimonialById({
      testimonialId,
      approvedBy: userId,
    });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
exports.CreateTestimonialController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id);
    const { patientId, content } = req.body;
    const response = await createTestimonial({
      userId,
      patientId,
      content,
    });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};

exports.UpdateTestimonialByIdController = async (req, res, next) => {
  try {
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};

exports.DeleteTestimonialByIdController = async (req, res, next) => {
  try {
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
