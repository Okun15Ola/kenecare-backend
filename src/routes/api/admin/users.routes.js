const router = require("express").Router();
const { adminLimiter } = require("../../../utils/rate-limit.utils");
const { authenticateAdmin } = require("../../../middlewares/auth.middleware");

router.use(authenticateAdmin, adminLimiter); // Authentication middleware & Rate limiting middleware applied to all routes in this router

router.get("/", (req, res, next) => {
  try {
    return res.sendStatus(200);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
