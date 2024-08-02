const axios = require("axios");

const {
  smsHiveClientId,
  smsHiveClientSecret,
  smsHiveAuthToken,
  smsHiveUrl,
} = require("../config/default.config");

const config = {
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
const sendPasswordResetSMS = async (mobileNumber) => {
  try {
    const data = JSON.stringify({
      from: "KENECARE",
      reference: "KENECARE",
      to: mobileNumber,
      content: `Account Notification. The password for your Kenecare Account ${mobileNumber} was recently changed.`,
    });

    config.data = data;
    await axios.request(config).catch((error) => {
      throw error;
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
const sendPrescriptionToken = async ({ token, doctorName, mobileNumber }) => {
  try {
    const data = JSON.stringify({
      from: "KENECARE",
      reference: "KENECARE",
      to: mobileNumber,
      content: `Your KENECARE Medical Prescription from Dr. ${doctorName} is ready.\n\nUse this token: ${token} to access your medical prescription.\n\nDo not share this token with anyone, not even the KENECARE. `,
    });

    config.data = data;
    await axios.request(config).catch((error) => {
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
      content: `Dear ${patientName}, your medical appointment with Dr. ${doctorName} has been approved.\n\nDate: ${appointmentDate}\nTime: ${appointmentTime}\nPatient: ${patientNameOnPrescription.toUpperCase()}.\n\nKENECARE`,
    });

    config.data = data;
    await axios.request(config).catch((error) => {
      throw error;
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
const appointmentStartedSms = async ({
  patientName,
  mobileNumber,
  doctorName,
  meetingJoinUrl,
}) => {
  try {
    const data = JSON.stringify({
      from: "KENECARE",
      reference: "KENECARE",
      to: mobileNumber,
      content: `Dear ${patientName}, your medical appointment with Dr. ${doctorName} has started.\n\nUse the link below to join the conversation\n\n${meetingJoinUrl}\n\nKENECARE`,
    });

    config.data = data;
    await axios.request(config).catch((error) => {
      throw error;
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
const appointmentEndedSms = async ({
  patientName,
  mobileNumber,
  doctorName,
}) => {
  try {
    const data = JSON.stringify({
      from: "KENECARE",
      reference: "KENECARE",
      to: mobileNumber,
      content: `Dear ${patientName}, your medical appointment with Dr. ${doctorName} has completed.\n\nThank you for choosing kenecare. Please don't forget to leave a review and rating for the appointment and doctor.\n\nKENECARE`,
    });

    config.data = data;
    await axios.request(config).catch((error) => {
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
      content: `Dear ${patientName}, your appointment with Dr. ${doctorName} has been postponed to a new date.\n\nDate: ${appointmentDate}\nTime: ${appointmentTime}\nPatient: ${patientNameOnPrescription.toUpperCase()}.\n\nKENECARE`,
    });

    config.data = data;
    await axios.request(config).catch((error) => {
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
      content: `Dear ${patientName}, you have successfully booked a medical appointment with Dr. ${doctorName}\n\nDate: ${appointmentDate}\nTime: ${appointmentTime}\nPatient: ${patientNameOnPrescription.toUpperCase()}.\n\nKENECARE `,
    });

    config.data = data;
    await axios.request(config).catch((error) => {
      throw error;
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const doctorAppointmentBookedSms = async ({
  mobileNumber,
  doctorName,
  patientNameOnPrescription,
  appointmentDate,
  appointmentTime,
}) => {
  try {
    if (mobileNumber) {
      const data = JSON.stringify({
        from: "KENECARE",
        reference: "KENECARE",
        to: mobileNumber,
        content: `Dear Dr. ${doctorName}, you have a new medical appointment with ${patientNameOnPrescription.toUpperCase()}.\n\nDate: ${appointmentDate}\nTime: ${appointmentTime}.\n\nKENECARE `,
      });

      config.data = data;
      await axios.request(config).catch((error) => {
        throw error;
      });
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const doctorProfileApprovalSms = async ({ mobileNumber, doctorName }) => {
  try {
    if (mobileNumber) {
      const data = JSON.stringify({
        from: "KENECARE",
        reference: "KENECARE",
        to: mobileNumber,
        content: `Good news Dr. ${doctorName}. Your KENECARE doctor profile has been approved.\n\nYou can now start receiving medical appointments from patients. Welcome aboard\n\nKENECARE TEAM`,
      });

      config.data = data;
      await axios.request(config).catch((error) => {
        throw error;
      });
    }
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
    if (mobileNumber) {
      const data = JSON.stringify({
        from: "KENECARE",
        reference: "KENECARE",
        to: mobileNumber,
        content: `Hi! Dr. ${doctorName}.\n\n${patientName} just shared a medical document with you. Login to your dashboard to access medical document`,
      });

      config.data = data;
      await axios.request(config).catch((error) => {
        throw error;
      });
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};
const withdrawalApprovedSMS = async ({ mobileNumber, doctorName }) => {
  try {
    const data = JSON.stringify({
      from: "KENECARE",
      reference: "KENECARE",
      to: mobileNumber,
      content: `Hi! Dr. ${doctorName}.\n\nYour wallet withdarwal has successfully been approved. You requested amount will be deposited into your respective account shortly.\n\nKENECARE TEAM`,
    });

    config.data = data;
    await axios.request(config).catch((error) => {
      throw error;
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
const withdrawalDeniedSMS = async ({ mobileNumber, doctorName, comment }) => {
  try {
    const data = JSON.stringify({
      from: "KENECARE",
      reference: "KENECARE",
      to: mobileNumber,
      content: `Hi! Dr. ${doctorName}.\n\nYour wallet withdarwal was declined, below is the reason for your request denial.\n\nCOMMENT:\n\n${comment}.\n\nKENECARE TEAM`,
    });

    config.data = data;
    await axios.request(config).catch((error) => {
      throw error;
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

module.exports = {
  sendAuthTokenSMS,
  sendPrescriptionToken,
  appointmentApprovalSms,
  appointmentStartedSms,
  appointmentEndedSms,
  appointmentPostponedSms,
  appointmentBookedSms,
  doctorAppointmentBookedSms,
  doctorProfileApprovalSms,
  documentSharedWithDoctorSMS,
  withdrawalApprovedSMS,
  withdrawalDeniedSMS,
  sendPasswordResetSMS,
};
