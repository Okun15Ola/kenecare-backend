const {
  twilioAccountSID,
  twilioAuthToken,
  twilioPhoneNumber,
  smsHiveClientId,
  smsHiveClientSecret,
  smsHiveAuthToken,
  smsHiveUrl,
} = require("../config/default.config");

const axios = require("axios");
const qs = require("qs");

const client = require("twilio")(twilioAccountSID, twilioAuthToken);

let config = {
  method: "post",
  maxBodyLength: Infinity,
  url: `${smsHiveUrl}/messages`,
  headers: {
    "X-Wallet": `Token ${smsHiveAuthToken}`,
    "Content-Type": "application/json",
  },
  auth: {
    username: smsHiveClientId,
    password: smsHiveClientSecret,
  },
};

const sendAuthTokenSMS = async ({ token, mobileNumber }) => {
  try {
    const data = JSON.stringify({
      from: "KENECARE",
      reference: "KENECARE",
      to: mobileNumber,
      content: `Your KENECARE AUTHToken is: ${token}. \n Do not share with anyone.`,
    });

    config.data = data;
    const response = await axios.request(config).catch((error) => {
      throw error;
    });
    console.log(response.data);
  } catch (error) {
    console.error(error);
    throw error;
  }
};
exports.sendVerificationSuccessSMS = async ({ token, mobileNumber }) => {
  try {
    const response = await client.messages.create({
      from: twilioPhoneNumber,
      to: "+23299822683",
      body: "Your Kenecare Account was succefully verified",
    });

    console.log(response.sid);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const buildRegistrationTokenSMS = function (token) {
  const message = `Your Kenecare Token is: ${token}. \n Do not share with anyone`;

  return message;
};

module.exports = {
  sendAuthTokenSMS,
};
