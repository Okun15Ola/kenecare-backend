exports.cacheKeyBulider = (key, limit, offset) => {
  return `${key}${limit ? `:limit=${limit}` : ""}${offset ? `:offset=${offset}` : ""}`;
};
