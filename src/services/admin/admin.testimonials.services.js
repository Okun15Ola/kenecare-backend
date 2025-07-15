const Response = require("../../utils/response.utils");
const logger = require("../../middlewares/logger.middleware");

exports.getAllTestimonials = async () => {
  try {
    return Response.SUCCESS();
  } catch (error) {
    logger.error("getAllTestimonials: ", error);
    throw error;
  }
};

exports.getTestimonial = async () => {
  try {
    return Response.SUCCESS();
  } catch (error) {
    logger.error("getTestimonial: ", error);
    throw error;
  }
};

exports.createTestimonial = async () => {
  try {
    return Response.CREATED();
  } catch (error) {
    logger.error("createTestimonial: ", error);
    throw error;
  }
};

exports.updateTestimonial = async () => {
  try {
    return Response.SUCCESS();
  } catch (error) {
    logger.error("updateTestimonial: ", error);
    throw error;
  }
};
exports.deleteTestimonial = async () => {
  try {
    return Response.SUCCESS();
  } catch (error) {
    logger.error("deleteTestimonial: ", error);
    throw error;
  }
};
