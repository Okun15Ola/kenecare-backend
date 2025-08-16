const { v4: uuidv4 } = require("uuid");
const featureFlagRepository = require("../../repository/featureFlag.repository");
const logger = require("../../middlewares/logger.middleware");
const { redisClient } = require("../../config/redis.config");
const Response = require("../../utils/response.utils");

const cacheKey = "feature-flags:all";

exports.getFeatureFlags = async () => {
  try {
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({
        data: JSON.parse(cachedData),
      });
    }
    const data = await featureFlagRepository.getAllFeatureFlags();

    if (!data?.length) {
      return Response.SUCCESS({
        message: "No Feature Flags Found at the moment",
        data: [],
      });
    }

    const flags = data.map((flag) => ({
      id: flag.flag_uuid,
      name: flag.flag_name,
      status: flag.is_enabled === 1,
      description: flag.description,
      rolloutPercentage: flag.rollout_percentage,
      createdAt: flag.created_at,
      updatedAt: flag.updated_at,
    }));

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(flags),
      expiry: 86400,
    });

    return Response.SUCCESS({
      data: flags,
    });
  } catch (error) {
    logger.error("getFeatureFlags: ", error);
    throw error;
  }
};

exports.createFeatureFlag = async ({
  flagName,
  description,
  isEnabled,
  rolloutPercentage,
}) => {
  try {
    const flagUuid = uuidv4();
    const { insertId } = await featureFlagRepository.createFeatureFlag({
      flagUuid,
      flagName,
      description,
      isEnabled,
      rolloutPercentage,
    });

    if (!insertId) {
      logger.error("Error adding feature flag: ", flagName);
      return Response.INTERNAL_SERVER_ERROR({
        message: "Something Went Wrong. Please Try Again",
      });
    }

    await redisClient.delete(cacheKey);
    await redisClient.delete(`feature-flag:${flagName}`);

    return Response.CREATED({ message: "Feature Flag Created Successfully. " });
  } catch (error) {
    logger.error("createFeatureFlag: ", error);
    throw error;
  }
};

exports.updateFeatureFlag = async ({
  flagName,
  description,
  isEnabled,
  rolloutPercentage,
}) => {
  try {
    const { affectedRows } = await featureFlagRepository.updateFlagByName({
      flagName,
      description,
      isEnabled,
      rolloutPercentage,
    });

    if (!affectedRows || affectedRows < 1) {
      logger.error("Error updating feature flag: ", flagName);
      return Response.NOT_MODIFIED();
    }

    await redisClient.delete(cacheKey);
    await redisClient.delete(`feature-flag:${flagName}`);

    return Response.SUCCESS({ message: "Feature Flag Updated Successfully. " });
  } catch (error) {
    logger.error("updateFeatureFlag: ", error);
    throw error;
  }
};

exports.updateFeatureFlagRolloutPercentage = async ({
  flagName,
  rolloutPercentage,
}) => {
  try {
    const { affectedRows } =
      await featureFlagRepository.updateRolloutPercentage({
        flagName,
        rolloutPercentage,
      });

    if (!affectedRows || affectedRows < 1) {
      logger.error(
        "Error updating feature flag rollout percentage: ",
        flagName,
      );
      return Response.NOT_MODIFIED();
    }

    await redisClient.delete(cacheKey);
    await redisClient.delete(`feature-flag:${flagName}`);

    return Response.SUCCESS({
      message: "Feature Flag Rollout Percentage Updated Successfully. ",
    });
  } catch (error) {
    logger.error("updateFeatureFlagRolloutPercentage: ", error);
    throw error;
  }
};

exports.toggleFeatureFlag = async ({ flagName, isEnabled }) => {
  try {
    const { affectedRows } = await featureFlagRepository.toggleFeatureFlag({
      flagName,
      isEnabled,
    });

    if (!affectedRows || affectedRows < 1) {
      logger.error("Error toggling feature flag: ", flagName);
      return Response.NOT_MODIFIED();
    }

    await redisClient.delete(cacheKey);
    await redisClient.delete(`feature-flag:${flagName}`);

    return Response.SUCCESS({
      message: "Feature Flag Status Updated Successfully. ",
    });
  } catch (error) {
    logger.error("toggleFeatureFlag: ", error);
    throw error;
  }
};

exports.deleteFeatureFlag = async (flagName) => {
  try {
    const { affectedRows } =
      await featureFlagRepository.deleteFeatureFlag(flagName);

    if (!affectedRows || affectedRows < 1) {
      logger.error("Error deleting feature flag: ", flagName);
      return Response.NOT_MODIFIED();
    }

    await redisClient.delete(cacheKey);
    await redisClient.delete(`feature-flag:${flagName}`);

    return Response.SUCCESS({
      message: "Feature Flag Deleted Successfully. ",
    });
  } catch (error) {
    logger.error("deleteFeatureFlag: ", error);
    throw error;
  }
};

/**
 * Utility to check if a feature is enabled for a particular user
 */
exports.isFeatureEnabledForUser = async (flagName, userId) => {
  const cacheKey = `feature-flag:${flagName}`;
  let flag = await redisClient.get(cacheKey);

  if (flag) {
    flag = JSON.parse(flag);
  } else {
    flag = await featureFlagRepository.getFeatureFlagByName(flagName);
    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(flag),
      expiry: 86400,
    });
  }

  if (!flag || flag.is_enabled === 0) {
    return false;
  }

  // Percentage rollout logic
  const bucket = userId % 100;
  console.log("user bucket: ", bucket, userId);
  if (bucket >= flag.rollout_percentage) {
    console.log("user not allowed");
    return false;
  }

  return true;
};
