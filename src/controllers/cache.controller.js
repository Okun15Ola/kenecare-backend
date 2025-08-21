const logger = require("../middlewares/logger.middleware");
const { redisClient } = require("../config/redis.config");
const Response = require("../utils/response.utils");

exports.clearAllCacheController = async (req, res, next) => {
  try {
    await redisClient.deleteAll();
    return res
      .status(200)
      .json(
        Response.SUCCESS({ message: "All Cache keys cleared successfully" }),
      );
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

exports.getAllCacheKeys = async (req, res, next) => {
  try {
    const pattern = "*";
    const keys = await redisClient.getAllKeys(pattern);
    if (!keys?.length)
      return res.status(200).json(
        Response.SUCCESS({
          message: "No cache key found at the moment",
          data: [],
        }),
      );
    return res.status(200).json(Response.SUCCESS({ data: keys }));
  } catch (error) {
    return next(error);
  }
};

exports.clearCacheByPatternController = async (req, res, next) => {
  try {
    const { pattern } = req.params;
    await redisClient.clearCacheByPattern(pattern);
    return res
      .status(200)
      .json(Response.SUCCESS({ message: "Cache key cleared successfully" }));
  } catch (error) {
    return next(error);
  }
};
