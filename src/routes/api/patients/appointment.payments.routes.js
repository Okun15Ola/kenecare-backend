const router = require("express").Router();
const paymentController = require("../../../controllers/payment.controller");

router.get("/om/return", paymentController.returnHandler);
router.get("/om/cancel", paymentController.cancelHandler);
router.post("/om/notification", paymentController.notificationHandler);
router.post("/monimee/webhook/return", paymentController.webhookHandler);

module.exports = router;
