// A simple reusable cache middleware
const cache = (seconds = 60, isPrivate = false) => {
  return (req, res, next) => {
    const scope = isPrivate ? "private" : "public";
    res.set("Cache-Control", `${scope}, max-age=${seconds}`);
    next();
  };
};

module.exports = cache;
