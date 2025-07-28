const apiClientService = require("../services/apiClient.services");
const logger = require("../middlewares/logger.middleware");

exports.createClientController = async (req, res, next) => {
  try {
    const { clientName, description, email, phone, website } = req.body;
    const response = await apiClientService.createApiClientService(
      clientName,
      description,
      email,
      phone,
      website,
    );
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

exports.deleteClientController = async (req, res, next) => {
  try {
    const { clientUuid } = req.params;
    const response = await apiClientService.deleteApiClientService(clientUuid);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

exports.getAllClientsController = async (req, res, next) => {
  try {
    const response = await apiClientService.getAllApiClientService();
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};
