const { query } = require("../repository/db.connection");
const { redisClient } = require("../config/redis.config");
const logger = require("./logger.middleware");

/**
 * Calculates pagination info and attaches it to the request.
 * @param {string} tableName - The name of the DB table to query.
 * @returns {Function} Express middleware.
 */
const calculatePaginationInfo = (tableName) => async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit, 10) || 10),
    );

    const offset = (page - 1) * limit;

    const cacheKey = `pagination:count:${tableName}`;
    let totalItems;

    const cachedCount = await redisClient?.get(cacheKey);

    if (cachedCount) {
      totalItems = parseInt(cachedCount, 10);
    } else {
      const countResult = await query(
        `SELECT COUNT(*) as total_rows FROM ${tableName}`,
      );

      if (!countResult[0]) {
        logger.error("[Pagination] No count result returned", countResult);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      totalItems = parseInt(countResult[0].total_rows, 10);
      await redisClient.set(cacheKey, JSON.stringify(totalItems), 300);
    }

    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    req.pagination = { page, limit, offset };

    req.paginationInfo = {
      totalItems,
      totalPages,
      currentPage: page,
      itemsPerPage: limit,
      nextPage: hasNextPage ? page + 1 : null,
      previousPage: hasPreviousPage ? page - 1 : null,
    };

    return next();
  } catch (error) {
    logger.error("[Pagination Middleware Error]", error.message);
    return next(error);
  }
};

module.exports = {
  calculatePaginationInfo,
};
