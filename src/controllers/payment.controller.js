const { clientAppUrl } = require("../config/default.config");
const {
  processAppointmentPayment,
  cancelAppointmentPayment,
  getPaymentStatusByConsultationId,
  processDoctorWithdrawalService,
} = require("../services/payment.services");
const logger = require("../middlewares/logger.middleware");
const {
  PAYMENT_FAILURE_PATH,
  PAYMENT_SUCCESS_PATH,
  REFERRAL,
  STATUS_COMPLETED,
  STATUS_SUCCESS,
  STATUS_FAILED,
  STATUS_EXPIRED,
} = require("../constants/payment.constants");

const redirectBasedOnStatus = (statusCode, res) => {
  if (statusCode === 304) {
    return res.redirect(`${clientAppUrl}${PAYMENT_SUCCESS_PATH}`);
  }
  if (statusCode === 400) {
    return res.redirect(`${clientAppUrl}${PAYMENT_FAILURE_PATH}`);
  }
  return res.redirect(`${clientAppUrl}${PAYMENT_SUCCESS_PATH}`);
};

exports.returnHandler = async (req, res, next) => {
  try {
    const { consultationId, referrer } = req.query;
    const response = await processAppointmentPayment({
      consultationId,
      referrer,
    });
    return redirectBasedOnStatus(response.statusCode, res);
  } catch (err) {
    logger.error(err);
    return next(err);
  }
};

exports.cancelHandler = async (req, res, next) => {
  try {
    const { consultationId, referrer } = req.query;
    const response = await cancelAppointmentPayment({
      consultationId,
      referrer,
    });
    return res.status(response.statusCode).json(response);
  } catch (err) {
    logger.error(err);
    return next(err);
  }
};

exports.notificationHandler = async (req, res, next) => {
  try {
    const { consultationId, referrer } = req.query;
    const response = await processAppointmentPayment({
      consultationId,
      referrer,
    });
    return redirectBasedOnStatus(response.statusCode, res);
  } catch (err) {
    logger.error(err);
    return next(err);
  }
};

exports.paymentStatusController = async (req, res, next) => {
  try {
    const { consultationId } = req.params;
    const response = await getPaymentStatusByConsultationId(consultationId);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

exports.paymentNotificationHandler = async (req, res, next) => {
  try {
    const { data } = req.body || {};
    const {
      status,
      progress: { isCompleted },
      id: transactionId,
      metadata: { orderId },
    } = data;

    let response = {};

    const baseParams = {
      consultationId: orderId,
      referrer: REFERRAL,
      transactionId,
      paymentEventStatus: status === STATUS_COMPLETED ? STATUS_SUCCESS : status,
    };

    if (
      (!isCompleted && status === STATUS_EXPIRED) ||
      (isCompleted && status === STATUS_COMPLETED)
    ) {
      response = await processAppointmentPayment(baseParams);
    }

    logger.info(response);
    return res.sendStatus(200);
  } catch (err) {
    logger.error("Webhook error:", err);
    return next(err);
  }
};

exports.payoutOutHandler = async (req, res, next) => {
  try {
    const { data } = req.body || {};
    const {
      status,
      id: transactionId,
      source: { transactionReference },
    } = data;

    res.sendStatus(200);

    let response = {};

    const baseParams = {
      transactionId,
      referrer: REFERRAL,
      transactionReference,
      paymentEventStatus: status,
    };

    if (status === STATUS_COMPLETED || status === STATUS_FAILED) {
      response = await processDoctorWithdrawalService(baseParams);
    }

    logger.info(response);
    return res.sendStatus(200);
  } catch (err) {
    logger.error("payout webhook error:", err);
    return next(err);
  }
};
