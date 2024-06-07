const router = require("express").Router();

router.get("/", (req, res, next) => {
  try {
    return res.sendStatus(200);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
