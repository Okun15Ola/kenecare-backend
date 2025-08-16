const { query } = require("./db.connection");
const queries = require("./queries/featureFlags.queries");

exports.createFeatureFlag = async ({
  flagUuid,
  flagName,
  description,
  isEnabled,
  rolloutPercentage,
}) => {
  return query(queries.CREATE_FEATURE_FLAG, [
    flagUuid,
    flagName,
    description,
    isEnabled,
    rolloutPercentage,
  ]);
};

exports.getAllFeatureFlags = async () => {
  return query(queries.GET_ALL_FEATURE_FLAGS);
};

exports.getFeatureFlagByName = async (flagName) => {
  const result = await query(queries.GET_FEATURE_FLAG_BY_NAME, [flagName]);
  return result[0];
};

exports.updateFlagByName = async ({
  flagName,
  description,
  isEnabled,
  rolloutPercentage,
}) => {
  return query(queries.UPDATE_FEATURE_FLAG_BY_NAME, [
    description,
    isEnabled,
    rolloutPercentage,
    flagName,
  ]);
};

exports.toggleFeatureFlag = async ({ flagName, isEnabled }) => {
  return query(queries.TOGGLE_FEATURE_FLAG_STATUS, [isEnabled, flagName]);
};

exports.updateRolloutPercentage = async ({ flagName, rolloutPercentage }) => {
  return query(queries.UPDATE_ROLL_OUT_PERCENTAGE, [
    rolloutPercentage,
    flagName,
  ]);
};

exports.deleteFeatureFlag = async (flagName) => {
  return query(queries.DELETE_FEATURE_FLAG, [flagName]);
};
