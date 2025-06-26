const rateLimiter = require("express-rate-limit");
const { nodeEnv } = require("../config/default.config");

// const limiter = rateLimit({
//   windowMs: 10 * 60 * 1000, // 10 minutes
//   limit: 25, // Limit each IP to 15 requests per `window` (here, per 10 minutes)
//   standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
//   legacyHeaders: false, // Disable the `X-RateLimit-*` headers
//   message: "Too many requests, please try again later.",
//   headers: true,
// });

const limiter = (router) => {
  if (nodeEnv === "production" || nodeEnv === "staging") {
    const limit = rateLimiter({
      windowMs: 10 * 60 * 1000, // 10 minutes
      max: 5, // Limit each IP to 5 requests per windowMs
      message: "Too many requests, please try again later.",
      headers: true,
    });
    router.use(limit);
  }
};

module.exports = { limiter };
