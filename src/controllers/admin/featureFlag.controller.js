const logger = require("../../middlewares/logger.middleware");
const flagService = require("../../services/admin/featureFlag.services");
const { STATUS } = require("../../utils/enum.utils");

exports.GetFeatureFlagsController = async (req, res, next) => {
  try {
    const response = await flagService.getFeatureFlags();
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

exports.CreateFeatureFlagController = async (req, res, next) => {
  try {
    const { flagName, description, isEnabled, rolloutPercentage } = req.body;
    const response = await flagService.createFeatureFlag({
      flagName,
      description,
      isEnabled,
      rolloutPercentage,
    });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

exports.UpdateFeatureFlagController = async (req, res, next) => {
  try {
    const { name } = req.params;
    const { description, isEnabled, rolloutPercentage } = req.body;
    const response = await flagService.updateFeatureFlag({
      flagName: name,
      description,
      isEnabled,
      rolloutPercentage,
    });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

exports.UpdateRolloutPercentageController = async (req, res, next) => {
  try {
    const { name } = req.params;
    const { rolloutPercentage } = req.body;
    const response = await flagService.updateFeatureFlagRolloutPercentage({
      flagName: name,
      rolloutPercentage,
    });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

exports.EnableFeatureFlagController = async (req, res, next) => {
  try {
    const { name } = req.params;
    const response = await flagService.toggleFeatureFlag({
      flagName: name,
      isEnabled: STATUS.ACTIVE,
    });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

exports.DisableFeatureFlagController = async (req, res, next) => {
  try {
    const { name } = req.params;
    const response = await flagService.toggleFeatureFlag({
      flagName: name,
      isEnabled: STATUS.NOT_ACTIVE,
    });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

exports.DeleteFeatureFlagController = async (req, res, next) => {
  try {
    const { name } = req.params;
    const response = await flagService.deleteFeatureFlag(name);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};
