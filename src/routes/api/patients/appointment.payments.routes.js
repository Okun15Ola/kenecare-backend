const router = require("express").Router();
const { clientAppUrl } = require("../../../config/default.config");
const {
  cancelAppointmentPayment,
  processAppointmentPayment,
} = require("../../../services/payment.services");

console.log("payment", clientAppUrl);

router.get("/om/return", async (req, res, next) => {
  try {
    const { consultationId, referrer } = req.query;

    const response = await processAppointmentPayment({
      consultationId,
      referrer,
    });

    const { statusCode } = response;

    if (statusCode === 304) {
      return res.redirect(clientAppUrl);
    } else if (statusCode === 400) {
      return res.redirect(`${clientAppUrl}/paymentFailure`);
    }

    return res.redirect(`${clientAppUrl}/paymentSuccess`);
  } catch (error) {
    next(error);
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
    next(error);
  }
});

module.exports = router;
