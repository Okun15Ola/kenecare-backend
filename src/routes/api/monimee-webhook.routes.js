const router = require("express").Router();
const paymentController = require("../../controllers/payment.controller");

router.post("/webhook/payout", paymentController.payoutOutHandler);

module.exports = router;
