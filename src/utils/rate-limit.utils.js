const rateLimit = require("express-rate-limit");
const RedisStore = require("rate-limit-redis").default;
const { RedisClient } = require("../config/redis.config");
const logger = require("../middlewares/logger.middleware");
const {
  // nodeEnv,
  maxRequest,
  maxAuthRequest,
  maxOtpRequest,
  maxFileUploadRequest,
  maxAdminRequest,
} = require("../config/default.config");

// Initialize Redis client properly with error handling
let redisClient;
try {
  const redisInstance = new RedisClient();
  redisClient = redisInstance.client;

  // Ensure Redis client is connected
  if (!redisClient || typeof redisClient.call !== "function") {
    throw new Error("Redis client not properly initialized");
  }
} catch (error) {
  logger.error("Failed to initialize Redis client for rate limiting:", error);
  // Set to null so we can fall back to memory store
  redisClient = null;
}

const defaultHandler = (req, res, next, options) => {
  logger.warn("Rate limit exceeded", {
    ip: req.ip,
    userId: req.user?.userId || null,
    apiKey: req.apiKey || null,
    method: req.method,
    path: req.originalUrl,
    time: new Date().toISOString(),
  });

  //  res.set({
  //       "Retry-After": Math.ceil(options.windowMs / 1000),
  //       "X-RateLimit-Limit": options.max,
  //       "X-RateLimit-Remaining": 0,
  //       "X-RateLimit-Reset": resetTime.toISOString(),
  //     });

  res.set("Retry-After", Math.ceil(options.windowMs / 1000));
  res.status(options.statusCode).json({
    error: "Too many requests",
    message: options.message,
    limit: options.max,
    method: req.method,
    path: req.originalUrl,
  });
};

const createLimiter = (
  max = maxRequest,
  windowMs = 60 * 1000,
  keyBy = "ip",
  skipPaths = [],
) => {
  const config = {
    windowMs,
    max,
    message: "Too many requests, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => skipPaths.includes(req.path),
    handler: defaultHandler,
    keyGenerator: (req) => {
      switch (keyBy) {
        case "user":
          if (req.user?.userId) {
            return `user-${req.user.userId}`;
          }
          break;
        case "apiKey":
          if (req.apiKey) {
            return `key-${req.apiKey}`;
          }
          break;
        case "ip":
        default:
          return req.ip;
      }
      // Fallback to IP if other methods don't work
      return req.ip;
    },
    skipFailedRequests: false,
    skipSuccessfulRequests: false,
  };

  // Only use Redis store if client is available, otherwise fall back to memory store
  if (redisClient) {
    try {
      config.store = new RedisStore({
        sendCommand: (...args) => redisClient.call(...args),
      });
    } catch (error) {
      logger.warn(
        "Failed to create Redis store for rate limiting, falling back to memory store:",
        error,
      );
    }
  } else {
    logger.warn(
      "Redis client not available, using memory store for rate limiting",
    );
  }

  return rateLimit(config);
};

const authLimiter = createLimiter(maxAuthRequest, 60 * 1000, "ip");
const otpLimiter = createLimiter(maxOtpRequest, 5 * 60 * 1000, "ip");
const uploadLimiter = createLimiter(maxFileUploadRequest, 60 * 1000, "user");
const limiter = createLimiter(maxRequest, 60 * 1000, "user");
const adminLimiter = createLimiter(maxAdminRequest, 60 * 1000, "user");

module.exports = {
  createLimiter,
  authLimiter,
  otpLimiter,
  uploadLimiter,
  limiter,
  adminLimiter,
};
