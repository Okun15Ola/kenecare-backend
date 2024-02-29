const axios = require("axios");
const qs = require("qs");
const crypto = require("crypto");
const {
  zoomAccountId,
  zoomClientId,
  zoomClientSecret,
  zoomSecretToken,
  zoomVerificationToken,
  zoomAccessTokenUrl,
  zoomApiUrl,
} = require("../config/default.config");

const getZoomAccessToken = async () => {
  try {
    const response = await axios.post(
      zoomAccessTokenUrl,
      qs.stringify({
        grant_type: "account_credentials",
        account_id: zoomAccountId,
      }),
      {
        auth: {
          username: zoomClientId,
          password: zoomClientSecret,
        },
      }
    );

    const { access_token } = response.data;
    return access_token;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const createZoomMeeting = async ({
  patientName,
  doctorName,
  appointmentDate,
  appointmentStartTime,
}) => {
  try {
    const token = await getZoomAccessToken();
    const response = await axios.post(
      `${zoomApiUrl}/meetings`,
      {
        topic: `${patientName} Meidical Appointment with Dr. ${doctorName}`,
        type: 2,
        start_time: `${appointmentDate}T${appointmentStartTime}`,
        duration: 60,
        timezone: "UTC",
        password: crypto.randomBytes(3).toString("hex"),
        agenda: `Kenecare Medical Appointment`,
        settings: {
          waiting_room: false,
          join_before_host: true,
          host_video: true,
          participant_video: true,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    const {
      uuid: zoomMeetingUUID,
      id: zoomMeetingID,
      topic: zoomMeetingTopic,
      agenda: zoomMeetingAgenda,
      start_url: zoomMeetingStartURL,
      join_url: zoomMeetingJoinURL,
      password: zoomMeetingPassword,
      encrypted_password: zoomMeetingEncPassword,
      status: zoomMeetingStatus,
    } = response.data;

    return {
      zoomMeetingUUID,
      zoomMeetingID,
      zoomMeetingTopic,
      zoomMeetingAgenda,
      zoomMeetingStartURL,
      zoomMeetingJoinURL,
      zoomMeetingPassword,
      zoomMeetingEncPassword,
      zoomMeetingStatus,
    };
  } catch (error) {
    console.log(error.response.data);
    throw error;
  }
};

// createZoomMeeting({
//   patientName: "Abdulai Samuel Moiwa",
//   appointmentDate: "2023-01-25",
//   appointmentStartTime: "16:00",
//   doctorName: "Isha Fofanah",
// });

module.exports = {
  createZoomMeeting,
};
