const moment = require("moment");
const bcrypt = require("bcryptjs");
const apiKeyRepository = require("../repository/apiKey.repository");
const Response = require("../utils/response.utils");
const logger = require("./logger.middleware");

exports.authenticateClient = async (req, res, next) => {
  try {
    // Get API key and secret from headers
    const apiKey = req.headers["x-api-key"];
    const apiSecret = req.headers["x-api-secret"];

    // Check if credentials are provided
    if (!apiKey || !apiSecret) {
      logger.warn(
        `Authentication attempt without proper credentials from ${req.ip}`,
      );
      return res.status(401).json(
        Response.UNAUTHORIZED({
          message: "API credentials required",
        }),
      );
    }

    // Validate API credentials
    const client = await apiKeyRepository.getApiKey(apiKey);

    if (!client) {
      logger.warn(`Invalid API key attempt: ${apiKey} from ${req.ip}`);
      return res.status(401).json(
        Response.BAD_REQUEST({
          message: "Invalid API credentials",
        }),
      );
    }

    const { expires_at: expiresAt, api_secret: hashedSecret } = client;

    if (moment() > expiresAt) {
      logger.warn(`Expired API key attempt: ${apiKey}`);
      return res.status(401).json(
        Response.UNAUTHORIZED({
          message: "API key has expired",
        }),
      );
    }

    const validSecret = await bcrypt.compare(apiSecret, hashedSecret);
    if (!validSecret) {
      logger.warn(`Invalid API secret attempt for key: ${apiKey}`);
      return res.status(401).json(
        Response.UNAUTHORIZED({
          message: "Invalid API credentials",
        }),
      );
    }

    apiKeyRepository.updateLastUsed(apiKey).catch((error) => {
      logger.error(`Failed to update last_used_at for key ${apiKey}: ${error}`);
    });

    return next();
  } catch (error) {
    return res.status(401).json(
      Response.UNAUTHORIZED({
        message: "Client Authentication error",
        error: error.message,
      }),
    );
  }
};
