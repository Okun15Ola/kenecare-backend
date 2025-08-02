const axios = require("axios");
const logger = require("../middlewares/logger.middleware");
const {
  smsHiveClientId,
  smsHiveClientSecret,
  smsHiveAuthToken,
  smsHiveUrl,
} = require("../config/default.config");
const { nodeEnv } = require("../config/default.config");

const config = {
  method: "post",
  maxBodyLength: Infinity,
  url: `${smsHiveUrl}/messages/sms`,
  headers: {
    "X-Wallet": `Token ${smsHiveAuthToken}`,
    "Content-Type": "application/json",
  },
  auth: {
    username: smsHiveClientId,
    password: smsHiveClientSecret,
  },
};

const sendVerificationTokenSMS = async ({ token, mobileNumber }) => {
  try {
    const data = JSON.stringify({
      from: "KENECARE",
      reference: "KENECARE",
      to: mobileNumber,
      content: `Your KENECARE Verification Code is: ${token}. \n Do not share this with anyone. It expires in 15 minutes.`,
    });

    config.data = data;
    if (nodeEnv === "development") {
      console.log("SIMULATION SEND SMS", data);
    } else {
      await axios.request(config).catch((error) => {
        throw error;
      });
    }

    logger.info("SMS sent successfully:");
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const sendAuthTokenSMS = async ({ token, mobileNumber }) => {
  try {
    const data = JSON.stringify({
      from: "KENECARE",
      reference: "KENECARE",
      to: mobileNumber,
      content: `Your KENECARE AUTHToken is: ${token}. \n Do not share this with anyone. It expires in 15 minutes.`,
    });

    config.data = data;
    if (nodeEnv === "development") {
      console.log("SIMULATION SEND SMS", data);
    } else {
      await axios.request(config).catch((error) => {
        throw error;
      });
    }
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
const sendMarketerVerificationTokenSMS = async ({
  firstName,
  token,
  mobileNumber,
}) => {
  try {
    const data = JSON.stringify({
      from: "KENECARE",
      reference: "KENECARE",
      to: mobileNumber,
      content: `Dear ${firstName}, your KENECARE Marketer profile was successfully created. Please provide this verification token: ${token} to your Kenecare admin for final verification.`,
    });

    config.data = data;
    if (nodeEnv === "development") {
      console.log("SIMULATION SEND SMS", data);
    } else {
      await axios.request(config).catch((error) => {
        throw error;
      });
    }
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
const sendMarketerPhoneVerifiedSMS = async ({
  firstName,
  mobileNumber,
  referralCode,
}) => {
  try {
    const data = JSON.stringify({
      from: "KENECARE",
      reference: "KENECARE",
      to: mobileNumber,
      content: `Dear ${firstName}, your phone number has successfully been verified.\nYour  Referral Code is: ${referralCode}. \n\nUse this code when signing up new user during marketing exercise.`,
    });

    config.data = data;
    if (nodeEnv === "development") {
      console.log("SIMULATION SEND SMS", data);
    } else {
      await axios.request(config).catch((error) => {
        throw error;
      });
    }
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
const sendMarketerUserRegisteredSMS = async ({
  marketerName,
  mobileNumber,
  userPhoneNumber,
  totalRegistered,
}) => {
  try {
    const data = JSON.stringify({
      from: "KENECARE",
      reference: "KENECARE",
      to: mobileNumber,
      content: `Congratulations! ${marketerName}, you have succesfully signed up ${userPhoneNumber} on Kenecare.\n\nTotal VERIFIED Users Registered: ${totalRegistered}\n\nKENECARE`,
    });

    config.data = data;
    if (nodeEnv === "development") {
      console.log("SIMULATION SEND SMS", data);
    } else {
      await axios.request(config).catch((error) => {
        throw error;
      });
    }
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
const sendForgotPasswordRequestTokenSMS = async ({ token, mobileNumber }) => {
  try {
    const data = JSON.stringify({
      from: "KENECARE",
      reference: "KENECARE",
      to: mobileNumber,
      content: `You requested to reset your KENECARE account password.\n\nYour reset password token is: ${token}.\n\n Do not share with anyone.\n\nIf this action was not perfomed by you please contact KENECARE support on https://kenecare.com/support`,
    });

    config.data = data;
    if (nodeEnv === "development") {
      console.log("SIMULATION SEND SMS", data);
    } else {
      await axios.request(config).catch((error) => {
        throw error;
      });
    }
  } catch (error) {
    logger.error(error);
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
    if (nodeEnv === "development") {
      console.log("SIMULATION SEND SMS", data);
    } else {
      await axios.request(config).catch((error) => {
        throw error;
      });
    }
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
const sendPrescriptionToken = async ({ doctorName, mobileNumber }) => {
  try {
    const data = JSON.stringify({
      from: "KENECARE",
      reference: "KENECARE",
      to: mobileNumber,
      content: `Your KENECARE Medical Prescription from Dr. ${doctorName} is ready.\n\nLogin to your account to view your medical prescriptions.\n\nKENECARE`,
    });

    config.data = data;
    if (nodeEnv === "development") {
      console.log("SIMULATION SEND SMS", data);
    } else {
      await axios.request(config).catch((error) => {
        throw error;
      });
    }
  } catch (error) {
    logger.error(error);
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
    if (nodeEnv === "development") {
      console.log("SIMULATION SEND SMS", data);
    } else {
      await axios.request(config).catch((error) => {
        throw error;
      });
    }
  } catch (error) {
    logger.error(error.response);
    throw error;
  }
};

const newFollowAppointmentSms = async ({
  patientNameOnPrescription,
  mobileNumber,
  doctorName,
  followUpDate,
  followUpTime,
}) => {
  try {
    const data = JSON.stringify({
      from: "KENECARE",
      reference: "KENECARE",
      to: mobileNumber,
      content: `Dear ${patientNameOnPrescription.toUpperCase()}, a follow-up appointment was scheduled by ${doctorName}.\n\nFollow-up Date: ${followUpDate}\nFollow-up Time: ${followUpTime}.\n\nKENECARE`,
    });

    config.data = data;
    if (nodeEnv === "development") {
      console.log("SIMULATION SEND SMS", data);
    } else {
      await axios.request(config).catch((error) => {
        throw error;
      });
    }
  } catch (error) {
    logger.error(error);
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
    if (nodeEnv === "development") {
      console.log("SIMULATION SEND SMS", data);
    } else {
      await axios.request(config).catch((error) => {
        throw error;
      });
    }
  } catch (error) {
    logger.error(error);
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
    if (nodeEnv === "development") {
      console.log("SIMULATION SEND SMS", data);
    } else {
      await axios.request(config).catch((error) => {
        throw error;
      });
    }
  } catch (error) {
    logger.error(error);
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
    logger.error(error);
    throw error;
  }
};

const doctorAppointmentCancelledSms = async ({
  mobileNumber,
  doctorName,
  patientNameOnPrescription,
  appointmentDate,
  appointmentTime,
  cancelReason,
}) => {
  try {
    const data = JSON.stringify({
      from: "KENECARE",
      reference: "KENECARE",
      to: mobileNumber,
      content: `Dear Dr. ${doctorName}, your appointment with  Patient: ${patientNameOnPrescription.toUpperCase()} has been cancelled.\n\nDate: ${appointmentDate}\nTime: ${appointmentTime}\nReason: ${cancelReason}\n\nKENECARE`,
    });

    config.data = data;
    await axios.request(config).catch((error) => {
      throw error;
    });
  } catch (error) {
    logger.error(error);
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
    const response = await axios.request(config).catch((error) => {
      throw error;
    });
    logger.info("Patient SMS Response: ", response);
  } catch (error) {
    logger.error(error);
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
      const response = await axios.request(config).catch((error) => {
        throw error;
      });
      logger.info("Doctor SMS Response: ", response);
    }
  } catch (error) {
    logger.error(error);
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
    logger.error(error);
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
    logger.error(error);
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
    logger.error(error);
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
    logger.error(error);
    throw error;
  }
};

module.exports = {
  sendAuthTokenSMS,
  sendVerificationTokenSMS,
  sendPrescriptionToken,
  appointmentApprovalSms,
  appointmentStartedSms,
  appointmentEndedSms,
  appointmentPostponedSms,
  doctorAppointmentCancelledSms,
  appointmentBookedSms,
  doctorAppointmentBookedSms,
  doctorProfileApprovalSms,
  documentSharedWithDoctorSMS,
  withdrawalApprovedSMS,
  withdrawalDeniedSMS,
  sendPasswordResetSMS,
  sendForgotPasswordRequestTokenSMS,
  newFollowAppointmentSms,
  sendMarketerVerificationTokenSMS,
  sendMarketerPhoneVerifiedSMS,
  sendMarketerUserRegisteredSMS,
};
