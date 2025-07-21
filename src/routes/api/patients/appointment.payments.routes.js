const router = require("express").Router();
const paymentController = require("../../../controllers/payment.controller");
const { limiter } = require("../../../utils/rate-limit.utils");
const {
  authenticateUser,
  authorizePatient,
} = require("../../../middlewares/auth.middleware");

router.get(
  "/om/return",
  authenticateUser,
  limiter,
  authorizePatient,
  paymentController.returnHandler,
);
router.get("/om/cancel", limiter, paymentController.cancelHandler);
router.post(
  "/om/notification",
  authenticateUser,
  limiter,
  authorizePatient,
  paymentController.notificationHandler,
);
router.post("/monimee/webhook/return", paymentController.webhookHandler);

module.exports = router;
