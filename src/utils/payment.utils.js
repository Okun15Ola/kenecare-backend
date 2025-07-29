require("dotenv").config({
  path: "../../.env",
});
const moment = require("moment");
const { v4: uuidV4 } = require("uuid");
const axios = require("axios").default;
const {
  apiBaseURL,
  monimeeApiKey,
  monimeeSpaceId,
  monimeeApiUrl,
  paymentCancelUrl,
} = require("../config/default.config");
const logger = require("../middlewares/logger.middleware");

const baseUrl = apiBaseURL;

const getPaymentUSSD = async ({ orderId, amount }) => {
  try {
    const idempotencyKey = uuidV4();
    const finalAmount = amount * 100;
    const options = {
      headers: {
        // eslint-disable-next-line prefer-template
        Authorization: `Bearer ${monimeeApiKey}`,
        "Monime-Space-Id": monimeeSpaceId,
        "Idempotency-Key": idempotencyKey,
        "Content-Type": "application/json",
      },
    };

    const body = {
      name: "Consultation Fee",
      mode: "oneTime",
      isActive: true,
      amount: { currency: "SLE", value: finalAmount },
      duration: "5m",
      metadata: {
        orderId,
        idempotencyKey,
      },
    };

    const response = await axios
      .post(`${monimeeApiUrl}/payment-codes`, body, options)
      .catch((error) => {
        logger.error("Error creating payment code: ", error);
        throw error;
      });

    const { success, result } = response.data;

    const {
      ussdCode,
      id: paymentCodeId,
      status: paymentCodeStatus,
      metadata,
      expireTime,
    } = result;
    const expiresAt = moment(expireTime).format("hh:mm");

    return success
      ? {
          ussdCode,
          paymentCodeId,
          paymentCodeStatus,
          idempotencyKey: metadata.idempotencyKey,
          expiresAt,
          cancelUrl: `${baseUrl}${paymentCancelUrl}?consultationId=${orderId}&referrer=kenecare.com`,
        }
      : null;
  } catch (error) {
    logger.error(error);
    logger.error("Error: ", error.response.data.error);
    throw error.response.data.error;
  }
};

const cancelPaymentUSSD = async (paymentId) => {
  try {
    const idempotencyKey = uuidV4();
    const options = {
      headers: {
        // eslint-disable-next-line prefer-template
        Authorization: `Bearer ${monimeeApiKey}`,
        "Monime-Space-Id": monimeeSpaceId,
        "Idempotency-Key": idempotencyKey,
        "Content-Type": "application/json",
      },
    };
    const body = {
      name: "Consultation Fee",
      isActive: false,
      status: "cancelled",
      expireTime: moment(),
      allowedProviders: null,
      metadata: {
        idempotencyKey,
      },
    };
    await axios
      .patch(`${monimeeApiUrl}/payment-codes/${paymentId}`, body, options)
      .catch((error) => {
        logger.error("Error cancelling payment code: ", error);
        throw error;
      });
  } catch (error) {
    logger.error("Error: ", error.response.data.error);
    throw error.response.data.error;
  }
};

module.exports = {
  getPaymentUSSD,
  cancelPaymentUSSD,
};
