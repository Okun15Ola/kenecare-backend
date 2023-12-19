const Response = require("../../utils/response.utils");
const logger = require("../../middlewares/logger.middleware");
const {
  getSpecializations,
  getSpecializationById,
  createSpecialization,
  updateSpecialization,
  deleteSpecialization,
  updateSpecializationStatus,
} = require("../../services/specializations.services");

exports.GetSpecializationsController = async (req, res, next) => {
  try {
    const response = await getSpecializations();
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
exports.GetSpecializationByIDController = async (req, res, next) => {
  try {
    const { id } = req.params;

    const response = await getSpecializationById(id);

    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};