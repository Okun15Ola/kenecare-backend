const router = require("express").Router();
const {
  cancelAppointmentPayment,
  processAppointmentPayment,
} = require("../../../services/payment.services");

router.get("/", (req, res, next) => {
  try {
    return res.send("Get Payment Url");
  } catch (error) {}
});
router.get("/om/return", async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id);
    const { consultationId, referrer } = req.query;

    const response = await processAppointmentPayment({
      userId,
      consultationId,
      referrer,
    });

    return res.status(response.statusCode).json(response);
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
    return res.status(response.statusCode).json(response);
  } catch (error) {
    next(error);
  }
});

router.post("/om/notification", (req, res, next) => {
  try {
    return res.send("Payment Notification Route");
  } catch (error) {
    next(error);
  }
});

module.exports = router;
