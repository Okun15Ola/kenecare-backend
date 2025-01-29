const router = require("express").Router();
const { clientAppUrl } = require("../../../config/default.config");
const logger = require("../../../middlewares/logger.middleware");
const {
  cancelAppointmentPayment,
  processAppointmentPayment,
} = require("../../../services/payment.services");

router.get("/om/return", async (req, res, next) => {
  try {
    const { consultationId, referrer } = req.query;

    const response = await processAppointmentPayment({
      consultationId,
      referrer,
    });

    const { statusCode } = response;

    if (statusCode === 304) {
      return res.redirect(`${clientAppUrl}/paymentSuccess`);
    }
    if (statusCode === 400) {
      return res.redirect(`${clientAppUrl}/paymentFailure`);
    }

    return res.redirect(`${clientAppUrl}/paymentSuccess`);
  } catch (error) {
    return next(error);
  }
});
router.get("/om/cancel", async (req, res, next) => {
  try {
    const { consultationId, referrer } = req.query;

    const response = await cancelAppointmentPayment({
      consultationId,
      referrer,
    });
    const { statusCode } = response;

    if (statusCode === 304) {
      return res.redirect(clientAppUrl);
    }

    return res.redirect(`${clientAppUrl}/paymentFailure`);
  } catch (error) {
    return next(error);
  }
});

router.post("/om/notification", async (req, res, next) => {
  try {
    const { consultationId, referrer } = req.query;

    const response = await processAppointmentPayment({
      consultationId,
      referrer,
    });

    const { statusCode } = response;

    if (statusCode === 304) {
      return res.redirect(clientAppUrl);
    }
    if (statusCode === 400) {
      return res.redirect(`${clientAppUrl}/paymentFailure`);
    }

    return res.redirect(`${clientAppUrl}/paymentSuccess`);
  } catch (error) {
    return next(error);
  }
});

router.post("/monimee/webhook/return", async (req, res, next) => {
  try {
    const { event, data } = req.body || {};
    const { name: eventName } = event || {};
    console.log(eventName);

    const {
      status,
      progress: { isCompleted },
      id: transactionId,
      metadata: { orderId },
    } = data;

    let response = {};

    if (!isCompleted && status === "expired") {
      // Process the payment
      response = await processAppointmentPayment({
        consultationId: orderId,
        referrer: "kenecare.com",
        transactionId,
        paymentEventStatus: status,
        status: status === "completed" ? "success" : status,
      });
    }
    if (isCompleted && status === "completed") {
      // Process the payment
      response = await processAppointmentPayment({
        consultationId: orderId,
        referrer: "kenecare.com",
        transactionId,
        paymentEventStatus: status === "completed" ? "success" : status,
      });
    }
    logger.info(response);
    // Respond with the appropriate status code
    return res.sendStatus(200);
  } catch (error) {
    console.error("Error handling webhook:", error);
    logger.error("Error handling paymen webhook: ", error);
    return next(error);
  }
});

module.exports = router;
