"use strict";
require("dotenv").config({
  path: "../../.env",
});

const qs = require("qs");
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
} = require("../config/default.config");
let baseUrl = apiBaseURL;
if (nodeEnv === "development") {
  baseUrl = "http://172.25.54.187:8500";
}

const getAccessToken = async (next) => {
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
        }
      )
      .catch((err) => {
        throw err;
      });
    const { token_type, access_token } = data;

    return `${token_type} ${access_token}`;
  } catch (error) {
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
          notif_url: `${baseUrl}${omNotificationURL}`,
          lang: "en",
          reference: "Kenecare",
        },
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      )
      .catch((error) => {
        console.log(error);
        throw error;
      });

    const { payment_url, notif_token, pay_token } = data;
    return { payment_url, notif_token, pay_token };
  } catch (error) {
    console.log(error);
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
      }
    )
    .catch((err) => {
      throw err;
    });

  return data;
};

module.exports = {
  getPaymentURL,
  checkTransactionStatus,
};
