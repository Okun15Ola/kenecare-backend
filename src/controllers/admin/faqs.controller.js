const logger = require("../../middlewares/logger.middleware");

exports.GetFaqsController = async (req, res, next) => {
  try {
    return res.send("Get FAQ'S");
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};
exports.GetFaqByIdController = async (req, res, next) => {
  try {
    return res.send("Get FAQ By ID");
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};
exports.CreateFaqController = async (req, res, next) => {
  try {
    return res.send("Create FAQ'S");
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

exports.UpdateFaqByIdController = async (req, res, next) => {
  try {
    return res.send("Get FAQ'S");
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};
exports.UpdateFaqStatusController = async (req, res, next) => {
  try {
    return res.send("Get FAQ'S");
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

exports.DeleteFaqByIdController = async (req, res, next) => {
  try {
    return res.sendStatus(200);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};
