const apiKeyService = require("../services/apiKey.services");
const logger = require("../middlewares/logger.middleware");

exports.createApiKeycontroller = async (req, res, next) => {
  try {
    const { clientId } = req.body;
    const response = await apiKeyService.createApiKeyService(clientId);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

exports.deactivateApiKeyController = async (req, res, next) => {
  try {
    const { keyUuid } = req.params;
    const response = await apiKeyService.deactivateApiKeyService(keyUuid);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

exports.extendApiKeyExpiryController = async (req, res, next) => {
  try {
    const { keyUuid } = req.params;
    const response = await apiKeyService.extendApiKeyService(keyUuid);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

exports.getAllApiKeyController = async (req, res, next) => {
  try {
    const response = await apiKeyService.getAllApiKeyService();
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};
