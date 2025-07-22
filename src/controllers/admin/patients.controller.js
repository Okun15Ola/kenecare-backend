const logger = require("../../middlewares/logger.middleware");
const {
  getAllPatients,
  getPatientById,
  getPatientsTestimonial,
} = require("../../services/patients/patients.services");

exports.GetPatientsController = async (req, res, next) => {
  try {
    const { limit, page } = req.query;
    const response = await getAllPatients(limit, page);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};
exports.GetPatientByIdController = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const response = await getPatientById(id);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};
exports.GetPatientTestimonialsController = async (req, res, next) => {
  try {
    const { limit, page } = req.query;
    const response = await getPatientsTestimonial(limit, page);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};
