const {
  twilioAccountSID,
  twilioAuthToken,
  twilioPhoneNumber,
} = require("../config/default.config");
const client = require("twilio")(twilioAccountSID, twilioAuthToken);

exports.sendTokenSMS = async ({ token, mobileNumber }) => {
  try {
    const response = await client.messages.create({
      from: twilioPhoneNumber,
      to: "+23299822683",
      body: buildRegistrationTokenSMS(token),
    });

    console.log(response.sid);
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
