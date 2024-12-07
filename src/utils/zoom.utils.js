const axios = require("axios");
const qs = require("qs");
const crypto = require("crypto");
// eslint-disable-next-line import/no-extraneous-dependencies
const WebSocketClient = require("websocket").client;
const logger = require("../middlewares/logger.middleware");

const client = new WebSocketClient();

client.on("connectionFailed", (error) => {
  logger.error(error);
});

client.on("connect", (connection) => {
  console.log("WebSocket Client Connected");
  connection.on("error", (error) => {
    logger.error(error);
  });
  connection.on("close", () => {
    console.log("echo-protocol Connection Closed");
  });
  connection.on("message", (message) => {
    if (message.type === "utf8") {
      console.log(`Received: '${message.utf8Data}'`);
    }
  });

  if (connection.connected) {
    console.log("Connected");
  }
});

const {
  zoomAccountId,
  zoomClientId,
  zoomClientSecret,
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
      },
    );

    const { access_token: accessToken } = response.data;
    return accessToken;
  } catch (error) {
    logger.error(error);
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
        agenda: "Kenecare Medical Appointment",
        settings: {
          waiting_room: false,
          join_before_host: true,
          host_video: true,
          participant_video: true,
          participant_focused_meeting: true,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
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

module.exports = {
  createZoomMeeting,
  getZoomAccessToken,
};
