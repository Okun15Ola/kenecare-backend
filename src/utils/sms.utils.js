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
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const appointmentApprovalSms = async ({
  patientName,
  mobileNumber,
  doctorName,
  patientNameOnPrescription,
  appointmentDate,
  appointmentTime,
}) => {
  try {
    const data = JSON.stringify({
      from: "KENECARE",
      reference: "KENECARE",
      to: mobileNumber,
      content: `Dear ${patientName}, your appointment with Dr. ${doctorName} has been approved.\n\nDate: ${appointmentDate}\nTime: ${appointmentTime}\nPatient: ${patientNameOnPrescription.toUpperCase()}.\n\nAn Email notification will be sent 30 minutes before the scheduled appointment with link to join the virtual meeting.\n\nKENECARE TEAM`,
    });

    config.data = data;
    const response = await axios.request(config).catch((error) => {
      throw error;
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const appointmentPostponedSms = async ({
  patientName,
  mobileNumber,
  doctorName,
  patientNameOnPrescription,
  appointmentDate,
  appointmentTime,
}) => {
  try {
    const data = JSON.stringify({
      from: "KENECARE",
      reference: "KENECARE",
      to: mobileNumber,
      content: `Dear ${patientName}, your appointment with Dr. ${doctorName} has been postponed to a new date.\n\nDate: ${appointmentDate}\nTime: ${appointmentTime}\nPatient: ${patientNameOnPrescription.toUpperCase()}.\n\nAn Email notification will be sent 30 minutes before the scheduled appointment with link to join the virtual meeting.\n\nKENECARE TEAM`,
    });

    config.data = data;
    const response = await axios.request(config).catch((error) => {
      throw error;
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const appointmentBookedSms = async ({
  mobileNumber,
  patientName,
  doctorName,
  patientNameOnPrescription,
  appointmentDate,
  appointmentTime,
}) => {
  try {
    const data = JSON.stringify({
      from: "KENECARE",
      reference: "KENECARE",
      to: mobileNumber,
      content: `Dear ${patientName}, you have successfully booked a medical appointment with Dr. ${doctorName}\n\nDate: ${appointmentDate}\nTime: ${appointmentTime}\nPatient: ${patientNameOnPrescription.toUpperCase()}.\n\nAn Email notification will be sent 30 minutes before the scheduled appointment with link to join the virtual meeting.\n\nKENECARE TEAM`,
    });

    config.data = data;
    const response = await axios.request(config).catch((error) => {
      throw error;
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const doctorProfileApprovalSms = async ({ mobileNumber, doctorName }) => {
  try {
    const data = JSON.stringify({
      from: "KENECARE",
      reference: "KENECARE",
      to: mobileNumber,
      content: `Good news Dr. ${doctorName}. Your KENECARE doctor profile has been approved.\n\nYou can now start receiving medical appointments from patients. Welcome aboard\n\nKENECARE TEAM`,
    });

    config.data = data;
    const response = await axios.request(config).catch((error) => {
      throw error;
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
const documentSharedWithDoctorSMS = async ({
  mobileNumber,
  doctorName,
  patientName,
}) => {
  try {
    const data = JSON.stringify({
      from: "KENECARE",
      reference: "KENECARE",
      to: mobileNumber,
      content: `Hi! Dr. ${doctorName}. ${patientName} just shared a medical document with you. Login to your dashboard to access medical document`,
    });

    config.data = data;
    const response = await axios.request(config).catch((error) => {
      throw error;
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

module.exports = {
  sendAuthTokenSMS,
  appointmentApprovalSms,
  appointmentPostponedSms,
  appointmentBookedSms,
  doctorProfileApprovalSms,
  documentSharedWithDoctorSMS,
};
