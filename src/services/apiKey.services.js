const { v4: uuidv4 } = require("uuid");
const moment = require("moment");
const Response = require("../utils/response.utils");
const logger = require("../middlewares/logger.middleware");
const apiKeyRepository = require("../repository/apiKey.repository");
const {
  getKeyPrefix,
  generateApiKeyAndSecret,
} = require("../utils/auth.utils");

const MAX_KEYS_PER_ENVIRONMENT = 5;

exports.createApiKeyService = async (clientId) => {
  try {
    const environmentPrefix = getKeyPrefix();
    const { keyCount } = await apiKeyRepository.countActiveKeysByEnvironment(
      clientId,
      environmentPrefix,
    );

    if (keyCount >= MAX_KEYS_PER_ENVIRONMENT) {
      logger.warn(
        `Client ${clientId} attempted to exceed key limit in ${environmentPrefix} environment`,
      );
      return Response.BAD_REQUEST({
        message: `Maximum limit of ${MAX_KEYS_PER_ENVIRONMENT} API keys reached for this environment. Please revoke unused keys before creating new ones.`,
      });
    }
    const keyUuid = uuidv4();
    const expiresAt = moment().add(1, "year").format("YYYY-MM-DD HH:mm:ss");
    const { apiKey, apiSecret, hashedApiSecret } =
      await generateApiKeyAndSecret();
    const { insertId } = await apiKeyRepository.createApiKey(
      keyUuid,
      clientId,
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
    return Response.SUCCESS({ message: "Api Key Expiry extended" });
  } catch (error) {
    logger.error("deactivateApiKeyService: ", error);
    throw error;
  }
};
