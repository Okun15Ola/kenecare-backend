const { query } = require("./db.connection");
const queries = require("./queries/apiKeys.queries");

exports.createApiKey = async (
  keyUuid,
  clientId,
  name,
  description,
  environment,
  apiKey,
  apiSecret,
  expiresAt,
) => {
  return query(queries.ADD_API_KEY, [
    keyUuid,
    clientId,
    name,
    description,
    environment,
    apiKey,
    apiSecret,
    expiresAt,
  ]);
};

exports.updateLastUsed = async (apiKey) => {
  return query(queries.UPDATE_LAST_USED, [apiKey]);
};

exports.deactivateKey = async (keyUuid) => {
  return query(queries.DEACTIVATE_KEY, [keyUuid, null]);
};

exports.extendKeyExpiry = async (expiresAt, keyUuid) => {
  return query(queries.EXTEND_EXPIRATION, [expiresAt, keyUuid, null]);
};

exports.getApiKey = async (key) => {
  const row = await query(queries.GET_API_KEY_BY_KEY, [key]);
  return row[0];
};

exports.getActiveApiKeyByUuid = async (keyUuid) => {
  const row = await query(queries.GET_ACTIVE_API_KEY_BY_UUID, [keyUuid]);
  return row[0];
};

exports.validateApiKey = async (key) => {
  return query(queries.VALIDATE_API_KEY, [key]);
};

exports.countActiveKeysByEnvironment = async (clientId, environment) => {
  const row = await query(queries.COUNT_ACTIVE_KEYS_BY_ENVIRONMENT, [
    clientId,
    environment,
  ]);
  return row[0];
};

exports.getAllApiKeys = async () => {
  return query(queries.GET_ALL_API_KEYS);
};
