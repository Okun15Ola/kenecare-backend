const router = require("express").Router();
const cacheController = require("../../controllers/cache.controller");
const { adminLimiter } = require("../../utils/rate-limit.utils");
const { authenticateAdmin } = require("../../middlewares/auth.middleware");

router.use(authenticateAdmin, adminLimiter);

router.get("/keys", cacheController.getAllCacheKeys);

router.delete("/", cacheController.clearAllCacheController);

router.delete("/keys/:pattern", cacheController.clearCacheByPatternController);

module.exports = router;
