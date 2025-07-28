const rateLimit = require("express-rate-limit");
const RedisStore = require("rate-limit-redis").default;
const redisClient = require("../config/redis.config");
const logger = require("../middlewares/logger.middleware");
const {
  // nodeEnv,
  maxRequest,
  maxAuthRequest,
  maxOtpRequest,
  maxFileUploadRequest,
  maxAdminRequest,
  maxApiClientRequest,
} = require("../config/default.config");

const defaultHandler = (req, res, next, options) => {
  logger.warn("Rate limit exceeded", {
    ip: req.ip,
    userId: req.user?.userId || null,
    apiKey: req.apiKey || null,
    method: req.method,
    path: req.originalUrl,
    time: new Date().toISOString(),
  });

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
      let key;
      switch (keyBy) {
        case "user":
          key = req.user?.userId ? `user-${req.user.userId}` : req.ip;
          break;
        // case "apiKey":
        //   key = req.apiKey ? `key-${req.apiKey}` : req.ip;
        //   break;
        default:
          key = req.ip;
      }
      return key;
    },
    skipFailedRequests: false,
    skipSuccessfulRequests: false,
  };

  // Only use Redis store if client is available, otherwise fall back to memory store
  if (redisClient?.client && typeof redisClient.client.call === "function") {
    config.store = new RedisStore({
      sendCommand: (...args) => redisClient.client.call(...args),
    });
  } else {
    logger.warn("Redis unavailable — using memory store for rate limiting");
  }

  return rateLimit(config);
};

const authLimiter = createLimiter(maxAuthRequest, 60 * 1000, "ip");
const otpLimiter = createLimiter(maxOtpRequest, 5 * 60 * 1000, "ip");
const uploadLimiter = createLimiter(maxFileUploadRequest, 60 * 1000, "user");
const limiter = createLimiter(maxRequest, 60 * 1000, "user");
const adminLimiter = createLimiter(maxAdminRequest, 60 * 1000, "user");
const apiClientLimiter = createLimiter(
  maxApiClientRequest,
  60 * 1000,
  "apiKey",
);

module.exports = {
  authLimiter,
  otpLimiter,
  uploadLimiter,
  limiter,
  adminLimiter,
  apiClientLimiter,
};
