const { CronJob } = require("cron");
const moment = require("moment");
const { getAppointments } = require("../db/db.appointments.admin");
const logger = require("../middlewares/logger.middleware");
// const WebSocketClient = require("websocket").client;
// const { getZoomAccessToken } = require("./zoom.utils");
// const { getZoomMeetingByZoomId } = require("../db/db.zoom-meetings");
// const { zoomWebSocketSubscriptionId } = require("../config/default.config");
// const {
//   getAppointmentByMeetingId,
//   updateDoctorAppointmentStartTime,
//   updateDoctorAppointmentEndTime,
// } = require("../db/db.appointments.doctors");
// const { getPatientById } = require("../db/db.patients");
// const { appointmentEndedSms, appointmentStartedSms } = require("./sms.utils");
// const client = new WebSocketClient();

const getAllAppointments = async () => {
  try {
    const appointments = await getAppointments();

    appointments
      .filter(
        ({ appointment_status: appointmentStatus }) =>
          appointmentStatus === "pending",
      )
      .forEach(
        ({
          appointment_date: appointmentDate,
          appointment_time: appointmentTime,
        }) => {
          const formattedAppointmentDate =
            moment(appointmentDate).format("YYYY-MM-DD");

          const appointmentDateTime = moment(
            `${formattedAppointmentDate} ${appointmentTime}`,
            "YYYY-MM-DD HH:mm:ss",
          );

          const currentDateTime = moment();

          const isSameDate = currentDateTime.isSame(appointmentDateTime, "day");

          if (isSameDate) {
            const diffInMinutes = appointmentDateTime.diff(
              currentDateTime,
              "minutes",
            );

            if (diffInMinutes > 0 && diffInMinutes === 30) {
              // TODO Send push notification
            }
            if (diffInMinutes > 0 && diffInMinutes === 5) {
              // TODO Send push notification
            }
          }
        },
      );
  } catch (error) {
    console.log(error);
    logger.error("CRON ERROR: ", error);
    throw error;
  }
};

// client.on("connect", (connection) => {
//   connection.on("error", (error) => {
//     logger.error("Socket Client Connection Error: ", error.message);
//   });

//   if (connection.connected) {
//     connection.on("message", async (message) => {
//       if (message.type !== "utf8") return;
//       try {
//         const data = JSON.parse(message.utf8Data);
//         if (data.module !== "message") return;
//         const { event, payload } = JSON.parse(data.content);
//         const {
//           id: zoomMeetingId,
//           start_time: startTime,
//           end_time: endTime,
//         } = payload.object;
//         const zoomMeeting = await getZoomMeetingByZoomId(zoomMeetingId);

//         if (!zoomMeeting) return;

//         const { meeting_id: meetingId } = zoomMeeting;
//         const appointment = await getAppointmentByMeetingId(meetingId);

//         if (!appointment) return;

//         const {
//           patient_id: patientId,
//           appointment_id: appointmentId,
//           first_name: firstName,
//           last_name: lastName,
//           doctor_first_name: doctorFirstName,
//           doctor_last_name: doctorLastName,
//           appointment_status: appointmentStatus,
//           join_url: zoomMeetingJoinURL,
//         } = appointment;

//         const [patient] = await Promise.allSettled([getPatientById(patientId)]);
//         const { mobile_number: mobileNumber } = patient.value;

//         if (event === "meeting.started") {
//           if (
//             appointmentStatus === "started" ||
//             appointmentStatus === "completed"
//           )
//             return;

//           await updateDoctorAppointmentStartTime({
//             appointmentId,
//             startTime: moment(startTime).format("HH:mm"),
//           });
//           // TODO: Send Notifications (PUSH & SMS) to patient that appointment has started
//           await appointmentStartedSms({
//             doctorName: `${doctorFirstName} ${doctorLastName}`,
//             patientName: `${firstName} ${lastName}`,
//             mobileNumber,
//             meetingJoinUrl: zoomMeetingJoinURL,
//           });
//         }

//         if (event === "meeting.ended") {
//           if (appointmentStatus === "completed") return;

//           await updateDoctorAppointmentEndTime({
//             appointmentId,
//             endTime: moment(endTime).format("HH:mm"),
//           });

//           await appointmentEndedSms({
//             doctorName: `${doctorFirstName} ${doctorLastName}`,
//             patientName: `${firstName} ${lastName}`,
//             mobileNumber,
//           });
//         }
//       } catch (error) {
//         console.error("Error processing message:", error);
//         logger.error("Error processing message (WebSocket): ", error);
//       }

//       //   const data = JSON.parse(message.utf8Data);

//       //   if (data.module === "message") {
//       //     const { event, payload } = JSON.parse(data.content);
//       //     if (event === "meeting.started") {
//       //       const { start_time: startTime, id: zoomMeetingId } = payload.object;
//       //       const zoomMeeting = await getZoomMeetingByZoomId(zoomMeetingId);
//       //       if (zoomMeeting) {
//       //         const { meeting_id: meetingId } = zoomMeeting;
//       //         const appointment = await getAppointmentByMeetingId(meetingId);
//       //         if (appointment) {
//       //           const { appointment_id: appointmentId } = appointment;
//       //           await updateDoctorAppointmentStartTime({
//       //             appointmentId,
//       //             startTime: moment(startTime).format("HH:mm"),
//       //           });

//       //           // TODO Send Notifications (PUSH & SMS ) to patient that appointment has started
//       //           console.info("Appointment has started");
//       //         }
//       //       }
//       //     }
//       //     if (event === "meeting.ended") {
//       //       console.log(payload.object);
//       //       const { end_time: endTime, id: zoomMeetingId } = payload.object;
//       //       const zoomMeeting = await getZoomMeetingByZoomId(zoomMeetingId);
//       //       if (zoomMeeting) {
//       //         const { meeting_id: meetingId } = zoomMeeting;
//       //         const appointment = await getAppointmentByMeetingId(meetingId);
//       //         if (appointment) {
//       //           const { appointment_id: appointmentId } = appointment;
//       //           await updateDoctorAppointmentEndTime({
//       //             appointmentId,
//       //             endTime: moment(endTime).format("HH:mm"),
//       //           });

//       //           // TODO Send Notifications (PUSH & SMS ) to patient that appointment has started
//       //           console.info("Appointment has ended");
//       //         }
//       //       }
//       //     }
//       //   }
//       // }
//       // return true;
//     });
//   }
// });

// CronJob.from({
//   cronTime: "*/30 * * * * *",
//   onTick: async () => {
//     const token = await getZoomAccessToken();
//     client.connect(
//       `wss://ws.zoom.us/ws?subscriptionId=${zoomWebSocketSubscriptionId}&access_token=${token}`,
//       { module: "heartbeat" },
//     );
//   },
//   start: true,
// });

module.exports = {
  runCron: () => {
    // 5 MINUTES TO APPOINTMENT CRON JOB
    CronJob.from({
      cronTime: "*/1 * * * *",
      onTick() {
        getAllAppointments();
      },
      start: true,
      timeZone: "utc",
    });
  },
};
