const logger = require("../../middlewares/logger.middleware");
const testimonialService = require("../../services/patients/patients.testimonial.services");

exports.CreatePatientTestimonialController = async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    const { content } = req.body;
    const response = await testimonialService.createTestimonialService({
      userId,
      content,
    });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error("CreatePatientTestimonialController: ", error);
    return next(error);
  }
};

exports.GetPatientTestimonialController = async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    const response =
      await testimonialService.getPatientTestimonialService(userId);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error("GetPatientTestimonialController: ", error);
    return next(error);
  }
};
