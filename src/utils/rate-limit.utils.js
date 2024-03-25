const rateLimiter = require("express-rate-limit");
const { nodeEnv } = require("../config/default.config");
const limiter = (rotuer) => {
  if (nodeEnv === "production") {
    const limit = rateLimiter({
      windowMs: 10 * 60 * 1000, // 10 minutes
      max: 5, // Limit each IP to 5 requests per windowMs
      message: "Too many requests, please try again later.",
      headers: true,
    });
    rotuer.use(limit);
  }
};
module.exports = { limiter };
