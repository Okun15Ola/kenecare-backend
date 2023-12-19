const logger = require("../../middlewares/logger.middleware");
const {
  getMedicalCouncils,
  getMedicalCouncil,

} = require("../../services/medical-councils.services");
exports.GetMedicalCouncilsController = async (req, res, next) => {
  try {
    const response = await getMedicalCouncils();
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
exports.GetMedicalCouncilByIDController = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const response = await getMedicalCouncil(id);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};