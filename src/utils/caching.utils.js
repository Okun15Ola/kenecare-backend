const { redisClient } = require("../config/redis.config");
const {
  getFileUrlFromS3Bucket,
  getPublicFileUrlFromS3Bucket,
} = require("./aws-s3.utils");

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

exports.fetchAndCacheUrl = async (urlKey, s3Key) => {
  if (!s3Key) {
    return null;
  }

  const cachedUrl = await redisClient.get(urlKey);
  if (cachedUrl) {
    return cachedUrl;
  }

  const fetchedUrl = await getFileUrlFromS3Bucket(s3Key);

  if (fetchedUrl) {
    await redisClient.set({ key: urlKey, value: fetchedUrl, expiry: 3600 });
  }

  return fetchedUrl;
};

exports.fetchAndCachePublicUrl = async (urlKey, s3Key) => {
  if (!s3Key) {
    return null;
  }

  const cachedUrl = await redisClient.get(urlKey);
  if (cachedUrl) {
    return cachedUrl;
  }

  const fetchedUrl = await getPublicFileUrlFromS3Bucket(s3Key);

  if (fetchedUrl) {
    await redisClient.set({ key: urlKey, value: fetchedUrl, expiry: 3600 });
  }

  return fetchedUrl;
};
