const logger = require("../../middlewares/logger.middleware");
const {
  getAllPatients,
  getPatientById,
  getPatientsTestimonial,
} = require("../../services/patients/patients.services");

exports.GetPatientsController = async (req, res, next) => {
  try {
    const {
      pagination: { limit, offset },
      paginationInfo,
    } = req;
    const response = await getAllPatients(limit, offset, paginationInfo);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
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
    console.error(error);
    logger.error(error);
    return next(error);
  }
};
exports.GetPatientTestimonialsController = async (req, res, next) => {
  try {
    const {
      pagination: { limit, offset },
      paginationInfo,
    } = req;
    const response = await getPatientsTestimonial(
      limit,
      offset,
      paginationInfo,
    );
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    return next(error);
  }
};
