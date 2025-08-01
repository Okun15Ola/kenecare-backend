const logger = require("../../middlewares/logger.middleware");
const doctorFaqService = require("../../services/doctors/doctor.faqs.services");

exports.GetDoctorFaqsController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id, 10);
    const { limit, page } = req.query;
    const response = await doctorFaqService.getDoctorFaqsService(
      userId,
      limit,
      page,
    );
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

exports.GetDoctorActiveFaqsController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id, 10);
    const { limit, page } = req.query;
    const response = await doctorFaqService.getDoctorActiveFaqsService(
      userId,
      limit,
      page,
    );
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

exports.GetDoctorFaqController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id, 10);
    const id = Number(req.params.id);
    const response = await doctorFaqService.getDoctorFaqByIdService(userId, id);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

exports.CreateDoctorFaqController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id, 10);
    const { question, answer } = req.body;
    const response = await doctorFaqService.createDoctorFaqService(
      userId,
      question,
      answer,
    );
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

exports.UpdateDoctorFaqController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id, 10);
    const id = Number(req.params.id);
    const { question, answer } = req.body;
    const response = await doctorFaqService.updateDoctorFaqService(
      userId,
      id,
      question,
      answer,
    );
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

exports.UpdateDoctorFaqStatusController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id, 10);
    const id = Number(req.params.id);
    const { isActive } = req.body;
    const response = await doctorFaqService.updateDoctorFaqStatusService(
      userId,
      id,
      isActive,
    );
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

exports.DeleteDoctorFaqController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id, 10);
    const id = Number(req.params.id);
    const response = await doctorFaqService.deleteDoctorFaqService(userId, id);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};
