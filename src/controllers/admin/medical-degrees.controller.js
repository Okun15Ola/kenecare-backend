const logger = require("../../middlewares/logger.middleware");

exports.GetMedicalDegreesController = async (req, res, next) => {
  try {
    return res.sendStatus(200);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};
exports.GetMedicalDegreeByIDController = async (req, res, next) => {
  try {
    return res.sendStatus(200);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};
exports.CreateMedicalDegreeController = async (req, res, next) => {
  try {
    return res.sendStatus(200);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

exports.UpdateMedicalDegreeByIdController = async (req, res, next) => {
  try {
    return res.sendStatus(200);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};
exports.UpdateMedicalDegreeStatusController = async (req, res, next) => {
  try {
    return res.sendStatus(200);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

exports.DeleteMedicalDegreeByIdController = async (req, res, next) => {
  try {
    return res.sendStatus(200);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};
