const Response = require("../utils/response.utils");
const logger = require("../middlewares/logger.middleware");

exports.GetMedicalDegreesController = async (req, res, next) => {
  try {
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
exports.GetMedicalDegreeByIDController = async (req, res, next) => {
  try {
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};