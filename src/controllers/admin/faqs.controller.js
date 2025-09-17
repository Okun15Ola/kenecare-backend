const logger = require("../../middlewares/logger.middleware");
const faqService = require("../../services/admin/faqs.services");

exports.GetFaqsController = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const response = await faqService.getFaqs(page, limit);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};
exports.CreateFaqController = async (req, res, next) => {
  try {
    const { question, answer, category, isPublished } = req.body;
    const response = await faqService.createFaq({
      question,
      answer,
      category,
      isPublished,
    });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

exports.UpdateFaqByIdController = async (req, res, next) => {
  try {
    const { question, answer, category, isPublished } = req.body;
    const { id } = req.params;
    const response = await faqService.updateFaq({
      faqUuid: id,
      question,
      answer,
      category,
      isPublished,
    });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

exports.PublishFaqController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const response = await faqService.publishFaq(id);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

exports.UnPublishFaqController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const response = await faqService.unPublishFaq(id);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

exports.DeleteFaqByIdController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const response = await faqService.deleteFaq(id);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};
