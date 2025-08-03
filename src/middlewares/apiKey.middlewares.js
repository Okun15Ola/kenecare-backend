const moment = require("moment");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const apiKeyRepository = require("../repository/apiKey.repository");
const Response = require("../utils/response.utils");
const logger = require("./logger.middleware");
const { redisClient } = require("../config/redis.config");
const { apiClientSecret } = require("../config/default.config");
const {
  generateApiClientJwtAccessToken,
  generateRefreshToken,
} = require("../utils/auth.utils");

// eslint-disable-next-line no-unused-vars
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
          message: "Authentication required to access this resource",
        }),
      );
    }

    // Validate API credentials
    const client = await apiKeyRepository.getApiKey(apiKey);

    if (!client) {
      logger.warn(`Invalid API key attempt: ${apiKey} from ${req.ip}`);
      return res.status(401).json(
        Response.BAD_REQUEST({
          message: "Invalid credentials",
        }),
      );
    }

    const { expires_at: expiresAt, api_secret: hashedSecret } = client;

    if (moment() > expiresAt) {
      logger.warn(`Expired API key attempt: ${apiKey}`);
      return res.status(401).json(
        Response.UNAUTHORIZED({
          message: "API key has expired. Please contact support.",
        }),
      );
    }

    const validSecret = await bcrypt.compare(apiSecret, hashedSecret);
    if (!validSecret) {
      logger.warn(`Invalid API secret attempt for key: ${apiKey}`);
      return res.status(401).json(
        Response.UNAUTHORIZED({
          message: "Authentication required to access this resource",
        }),
      );
    }

    const apiAccessToken = generateApiClientJwtAccessToken({
      apiKey,
      type: "api_client",
    });
    const refreshToken = generateRefreshToken();

    await Promise.all([
      redisClient.set({
        key: `api:token:${apiKey}:${apiAccessToken}`,
        value: JSON.stringify({ apiKey, created: new Date().toISOString() }),
        expiry: 30 * 24 * 60 * 60, // 30days
      }),
      redisClient.set({
        key: `api:refresh:${apiKey}`,
        value: refreshToken,
        ttl: 90 * 24 * 60 * 60, // 180 days
      }),
    ]);

    apiKeyRepository.updateLastUsed(apiKey).catch((error) => {
      logger.error(`Failed to update last_used_at for key ${apiKey}: ${error}`);
    });

    req.apiKey = apiKey; // Set this for rate limiting
    return res.status(200).json(
      Response.SUCCESS({
        message: "Authentication successful",
        data: {
          apiToken: apiAccessToken,
          apiRefreshToken: refreshToken,
        },
      }),
    );
  } catch (error) {
    console.error("client auth error: ", error);
    logger.error("Client Authentication Error: ", error);
    return res.status(401).json(
      Response.UNAUTHORIZED({
        message: "Authentication required to access this resource",
      }),
    );
  }
};

/**
 * Middleware to validate a JWT access token from the X-Client-Authorization header.
 * This should be used on protected API routes.
 */
exports.validateClientToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["x-client-authorization"];

    if (!authHeader?.startsWith("Bearer ")) {
      console.log("Error here");
      logger.warn(`Missing or malformed token from ${req.ip}`);
      return res.status(401).json(
        Response.UNAUTHORIZED({
          message: "Authentication required to access this resource",
        }),
      );
    }

    const token = authHeader.split(" ")[1];

    // Verify JWT signature and expiration
    let decoded;
    try {
      decoded = jwt.verify(token, apiClientSecret);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        logger.warn(`Expired token attempt for key: ${error.expiredAt}`);
        return res.status(401).json(
          Response.UNAUTHORIZED({
            message:
              "Access token expired. Please use the refresh token to get a new one.",
          }),
        );
      }
      logger.warn(`Invalid token: ${error.message}`);
      return res.status(401).json(
        Response.UNAUTHORIZED({
          message: "Authentication required to access this resource",
        }),
      );
    }

    // Get API key from token payload
    const { apiKey } = decoded;

    // Check if token is in Redis (to prevent using revoked or expired tokens)
    const tokenData = await redisClient.get(`api:token:${apiKey}:${token}`);
    if (!tokenData) {
      logger.warn(`Token not found in cache or revoked: ${apiKey}`);
      return res.status(401).json(
        Response.UNAUTHORIZED({
          message: "Authentication required to access this resource",
        }),
      );
    }

    // Check if API key is still valid in the database
    const client = await apiKeyRepository.getApiKey(apiKey);
    if (!client || moment().isAfter(moment(client.expires_at))) {
      logger.warn(`API key no longer exists or has expired: ${apiKey}`);
      return res.status(401).json(
        Response.UNAUTHORIZED({
          message: "Authentication required to access this resource",
        }),
      );
    }

    // Update API key last used (asynchronously)
    apiKeyRepository.updateLastUsed(apiKey).catch((error) => {
      logger.error(`Failed to update last_used_at for key ${apiKey}: ${error}`);
    });

    // Store API key for later use in other middleware or controllers
    req.apiKey = apiKey;

    return next();
  } catch (error) {
    logger.error("Token validation error:", error);
    return res.status(500).json(
      Response.INTERNAL_SERVER_ERROR({
        message: "An unexpected error occurred",
      }),
    );
  }
};

/**
 * Middleware to generate a new JWT access token using a valid refresh token.
 * This should be used on a dedicated endpoint, e.g., POST /auth/refresh.
 */
// eslint-disable-next-line no-unused-vars
exports.refreshClientToken = async (req, res, next) => {
  try {
    const { apiKey, refreshToken } = req.body;
    if (!apiKey || !refreshToken) {
      return res.status(400).json(
        Response.BAD_REQUEST({
          message: "API key and refresh token are required.",
        }),
      );
    }

    // Check if the provided refresh token exists and matches the one in Redis
    const storedRefreshToken = await redisClient.get(`api:refresh:${apiKey}`);
    if (!storedRefreshToken || storedRefreshToken !== refreshToken) {
      logger.warn(`Invalid refresh token provided for key: ${apiKey}`);
      return res.status(401).json(
        Response.UNAUTHORIZED({
          message: "Invalid or expired refresh token.",
        }),
      );
    }

    // Invalidate the old refresh token by deleting it from Redis
    await redisClient.delete(`api:refresh:${apiKey}`);

    // Generate a new access token and a new refresh token
    const newAccessToken = generateApiClientJwtAccessToken({
      apiKey,
      type: "api_client",
    });
    const newRefreshToken = generateRefreshToken();

    // Store the new tokens in Redis
    await Promise.all([
      redisClient.set({
        key: `api:token:${apiKey}:${newAccessToken}`,
        value: JSON.stringify({ apiKey, created: new Date().toISOString() }),
        expiry: 30 * 24 * 60 * 60, // 30days
      }),
      redisClient.set({
        key: `api:refresh:${apiKey}`,
        value: refreshToken,
        ttl: 90 * 24 * 60 * 60, // 180 days
      }),
    ]);

    return res.status(200).json(
      Response.SUCCESS({
        message: "Token refreshed successfully",
        data: {
          apiAccessToken: newAccessToken,
          apiRefreshToken: newRefreshToken,
        },
      }),
    );
  } catch (error) {
    logger.error("Token refresh error:", error);
    return res.status(500).json(
      Response.INTERNAL_SERVER_ERROR({
        message: "An unexpected error occurred during token refresh",
      }),
    );
  }
};
