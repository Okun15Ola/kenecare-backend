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
        throw err;
      });
    const { token_type: tokenType, access_token: accessToken } = data;

    return `${tokenType} ${accessToken}`;
  } catch (error) {
    console.error("GET PAYMENT ACCESS TOKEN ERROR: ", error);
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
        throw error;
      });

    const {
      payment_url: paymentUrl,
      notif_token: notificationToken,
      pay_token: paymentToken,
    } = data;
    return { paymentUrl, notificationToken, paymentToken };
  } catch (error) {
    console.error(error);
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
      throw err;
    });

  return data;
};

module.exports = {
  getPaymentURL,
  checkTransactionStatus,
};
