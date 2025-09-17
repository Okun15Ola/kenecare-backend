const { v4: uuidv4 } = require("uuid");
const moment = require("moment");
const Response = require("../utils/response.utils");
const logger = require("../middlewares/logger.middleware");
const apiKeyRepository = require("../repository/apiKey.repository");
const { generateApiKeyAndSecret } = require("../utils/auth.utils");
const { redisClient } = require("../config/redis.config");
const { mapApiKeyRow } = require("../utils/db-mapper.utils");

const MAX_KEYS_PER_ENVIRONMENT = 5;

exports.createApiKeyService = async (
  clientId,
  name,
  description,
  environment,
) => {
  try {
    const { keyCount } = await apiKeyRepository.countActiveKeysByEnvironment(
      clientId,
      environment,
    );

    if (keyCount >= MAX_KEYS_PER_ENVIRONMENT) {
      logger.warn(
        `Client ${clientId} attempted to exceed key limit in ${environment} environment`,
      );
      return Response.BAD_REQUEST({
        message: `Maximum limit of ${MAX_KEYS_PER_ENVIRONMENT} API keys reached for this environment. Please revoke unused keys before creating new ones.`,
      });
    }
    const keyUuid = uuidv4();
    const expiresAt = moment().add(1, "year").format("YYYY-MM-DD HH:mm:ss");
    const { apiKey, apiSecret, hashedApiSecret } =
      await generateApiKeyAndSecret(environment);
    const { insertId } = await apiKeyRepository.createApiKey(
      keyUuid,
      clientId,
      name,
      description,
      environment,
      apiKey,
      hashedApiSecret,
      expiresAt,
    );

    if (!insertId) {
      logger.error("Fail to add api key");
      return Response.INTERNAL_SERVER_ERROR({
        message: "Something went wrong. Please try again",
      });
    }
    await redisClient.delete("api-keys:all");
    return Response.CREATED({
      data: {
        apiKey,
        apiSecret,
      },
    });
  } catch (error) {
    logger.error("createApiKeyService: ", error);
    throw error;
  }
};

exports.deactivateApiKeyService = async (keyUuid) => {
  try {
    const { affectedRows } = await apiKeyRepository.deactivateKey(keyUuid);

    if (!affectedRows || affectedRows < 1) {
      logger.error("Fail to deactivate api key");
      return Response.INTERNAL_SERVER_ERROR({
        message: "Something went wrong. Please try again.",
      });
    }
    await redisClient.delete("api-keys:all");
    return Response.SUCCESS({ message: "Api Key Deactivated" });
  } catch (error) {
    logger.error("deactivateApiKeyService: ", error);
    throw error;
  }
};

exports.extendApiKeyService = async (keyUuid) => {
  try {
    const expiresAt = moment().add(1, "year").format("YYYY-MM-DD HH:mm:ss");
    const { affectedRows } = await apiKeyRepository.extendKeyExpiry(
      expiresAt,
      keyUuid,
    );

    if (!affectedRows || affectedRows < 1) {
      logger.error("Fail to extend api key expiry date");
      return Response.INTERNAL_SERVER_ERROR({
        message: "Something went wrong. Please try again.",
      });
    }

    await redisClient.delete("api-keys:all");
    return Response.SUCCESS({ message: "Api Key Expiry extended" });
  } catch (error) {
    logger.error("deactivateApiKeyService: ", error);
    throw error;
  }
};

exports.getAllApiKeyService = async () => {
  try {
    const cachekey = "api-keys:all";
    const cachedData = await redisClient.get(cachekey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }

    const data = await apiKeyRepository.getAllApiKeys();

    if (!data?.length) {
      return Response.SUCCESS({
        message: "No Api Keys Found.",
      });
    }

    const keys = data.map(mapApiKeyRow);

    await redisClient.set({
      key: cachekey,
      value: JSON.stringify(keys),
    });
    return Response.SUCCESS({ keys });
  } catch (error) {
    logger.error("getAllApiKeyService: ", error);
    throw error;
  }
};
