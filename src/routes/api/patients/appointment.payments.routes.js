const router = require("express").Router();
const paymentController = require("../../../controllers/payment.controller");
const { limiter } = require("../../../utils/rate-limit.utils");
const {
  authenticateUser,
  authorizePatient,
} = require("../../../middlewares/auth.middleware");

router.use(authenticateUser, limiter, authorizePatient); // Authentication middleware & Rate limiting middleware applied to all routes in this router

router.get("/om/return", paymentController.returnHandler);
router.get("/om/cancel", paymentController.cancelHandler);
router.post("/om/notification", paymentController.notificationHandler);
router.post("/monimee/webhook/return", paymentController.webhookHandler);

module.exports = router;
