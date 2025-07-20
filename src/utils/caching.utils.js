const { redisClient } = require("../config/redis.config");

exports.cacheKeyBulider = (key, limit, offset) => {
  return `${key}${limit ? `:limit=${limit}` : ""}${offset ? `:offset=${offset}` : ""}`;
};

exports.getCachedCount = async ({ cacheKey, countQueryFn, expiry = 300 }) => {
  let totalRows = await redisClient.get(cacheKey);
  if (totalRows) {
    return parseInt(totalRows, 10);
  }
  const { totalRows: dbCount } = await countQueryFn();
  totalRows = dbCount || 0;
  await redisClient.set({ key: cacheKey, value: totalRows, expiry });
  return totalRows;
};

exports.getPaginationInfo = ({ totalRows, limit, page }) => {
  const totalPages = Math.ceil(totalRows / limit);
  return {
    totalItems: totalRows,
    totalPages,
    currentPage: page,
    itemsPerPage: limit,
    nextPage: page < totalPages ? page + 1 : null,
    previousPage: page > 1 ? page - 1 : null,
  };
};
