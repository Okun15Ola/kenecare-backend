const router = require("express").Router();
const paymentController = require("../../../controllers/payment.controller");
const { limiter } = require("../../../utils/rate-limit.utils");
const {
  authenticateUser,
  authorizePatient,
} = require("../../../middlewares/auth.middleware");

router.get(
  "/return",
  authenticateUser,
  limiter,
  authorizePatient,
  paymentController.returnHandler,
);
router.get(
  "/status/:consultationId",
  authenticateUser,
  authorizePatient,
  paymentController.paymentStatusController,
);
router.get("/cancel", limiter, paymentController.cancelHandler);

router.post(
  "/monimee/webhook/payment",
  paymentController.paymentNotificationHandler,
);

module.exports = router;
