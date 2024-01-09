const router = require("express").Router();

router.get("/payment", (req, res, next) => {
  try {
    return res.send("Get Payment Url");
  } catch (error) {}
});
router.post("/payments/om/return", (req, res, next) => {
  try {
    return res.send("Payment Return Route");
  } catch (error) {
    next(error);
  }
});
router.post("/payments/om/cancel", (req, res, next) => {
  try {
    return res.send("Payment Cancel Route");
  } catch (error) {
    next(error);
  }
});
router.post("/payments/om/notification", (req, res, next) => {
  try {
    return res.send("Payment Notification Route");
  } catch (error) {
    next(error);
  }
});

module.exports = router;
