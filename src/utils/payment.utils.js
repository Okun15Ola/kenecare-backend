require("dotenv").config({
  path: "../../.env",
});
const moment = require("moment");
const qs = require("qs");
const { v4: uuidV4 } = require("uuid");
const axios = require("axios").default;
const {
  omReturnURL,
  omCancelURL,
  omNotificationURL,
  omMerchantKey,
  omBasicAuthToken,
  omWebPaymentUrl,
  omTokenUrl,
  omTransactionStatusUrl,
  omCurrency,
  apiBaseURL,
  nodeEnv,
  monimeeApiKey,
  monimeeSpaceId,
  monimeeApiUrl,
} = require("../config/default.config");
const logger = require("../middlewares/logger.middleware");

let baseUrl = apiBaseURL;
if (nodeEnv === "development") {
  baseUrl = "https://personally-beloved-bass.ngrok-free.app";
}

const getAccessToken = async () => {
  try {
    const { data } = await axios
      .post(
        omTokenUrl,
        qs.stringify({
          grant_type: "client_credentials",
        }),
        {
          headers: {
            Authorization: omBasicAuthToken,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
      )
      .catch((err) => {
        logger.error("Error fetching access token: ", err);
        throw err;
      });
    const { token_type: tokenType, access_token: accessToken } = data;

    return `${tokenType} ${accessToken}`;
  } catch (error) {
    logger.error("GET PAYMENT ACCESS TOKEN ERROR: ", error);
    throw error;
  }
};

const getPaymentURL = async ({ orderId, amount }) => {
  try {
    const token = await getAccessToken();

    const { data } = await axios
      .post(
        omWebPaymentUrl,
        {
          merchant_key: omMerchantKey,
          currency: omCurrency,
          order_id: orderId,
          amount: Number(amount),
          return_url: `${baseUrl}${omReturnURL}?consultationId=${orderId}&referrer=kenecare.com`,
          cancel_url: `${baseUrl}${omCancelURL}?consultationId=${orderId}&referrer=kenecare.com`,
          notif_url: `${baseUrl}${omNotificationURL}?consultationId=${orderId}&referrer=kenecare.com`,
          lang: "en",
          reference: "Kenecare",
        },
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        },
      )
      .catch((error) => {
        logger.error("Error fetching payment URL: ", error);
        throw error;
      });

    const {
      payment_url: paymentUrl,
      notif_token: notificationToken,
      pay_token: paymentToken,
    } = data;
    return { paymentUrl, notificationToken, paymentToken };
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const checkTransactionStatus = async ({ orderId, amount, payToken }) => {
  const token = await getAccessToken();
  const { data } = await axios
    .post(
      omTransactionStatusUrl,
      {
        order_id: orderId,
        amount: Number(amount),
        pay_token: payToken,
      },
      {
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      },
    )
    .catch((err) => {
      logger.error("Error checking transaction status: ", err);
      throw err;
    });

  return data;
};

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
      duration: "3m",
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
          cancelUrl: `${baseUrl}${omCancelURL}?consultationId=${orderId}&referrer=kenecare.com`,
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
  getPaymentURL,
  checkTransactionStatus,
  getPaymentUSSD,
  cancelPaymentUSSD,
};
