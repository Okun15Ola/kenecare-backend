const { query } = require("./db.connection");
const queries = require("./queries/doctorAppointments.queries");

exports.getAppointmentsByDoctorId = async ({
  doctorId,
  offset = 1,
  limit = 20,
}) => {
  const optimizedQuery = `${queries.GET_APPOINTMENTS_BY_DOCTOR_ID} LIMIT ${limit} OFFSET ${offset}`;
  return query(optimizedQuery, [doctorId]);
};

exports.getDoctorAppointmentById = async ({ doctorId, appointmentId }) => {
  const row = await query(queries.GET_DOCTOR_APPOINTMENT_BY_ID, [
    doctorId,
    appointmentId,
  ]);
  return row[0];
};

exports.getAppointmentByMeetingId = async (meetingId) => {
  const row = await query(queries.GET_APPOINTMENT_BY_MEETING_ID, [meetingId]);
  return row[0];
};

exports.approveDoctorAppointmentById = async ({ doctorId, appointmentId }) => {
  return query(queries.APPROVE_APPOINTMENT, [doctorId, appointmentId]);
};

exports.updateDoctorAppointmentMeetingId = async ({
  doctorId,
  appointmentId,
  meetingId,
}) => {
  return query(queries.UPDATE_MEETING_ID, [doctorId, appointmentId, meetingId]);
};

exports.updateDoctorAppointmentStartTime = async ({
  appointmentId,
  startTime,
}) => {
  return query(queries.UPDATE_START_TIME, [appointmentId, startTime]);
};

exports.updateDoctorAppointmentEndTime = async ({ appointmentId, endTime }) => {
  return query(queries.UPDATE_END_TIME, [appointmentId, endTime]);
};

exports.cancelDoctorAppointmentById = async ({
  doctorId,
  appointmentId,
  cancelReason,
}) => {
  return query(queries.CANCEL_APPOINTMENT, [
    doctorId,
    appointmentId,
    cancelReason,
  ]);
};

exports.postponeDoctorAppointmentById = async ({
  doctorId,
  appointmentId,
  postponedReason,
  postponedDate,
  postponedTime,
}) => {
  return query(queries.POSTPONE_APPOINTMENT, [
    doctorId,
    appointmentId,
    postponedReason,
    postponedDate,
    postponedTime,
  ]);
};

exports.getDoctorAppointByDate = async ({
  doctorId,
  startDate,
  endDate,
  limit,
  offset,
}) => {
  const optimizedQuery = `${queries.GET_APPOINTMENTS_BY_DATE} LIMIT ${limit} OFFSET ${offset};`;
  return query(optimizedQuery, [doctorId, startDate, endDate]);
};

exports.getDoctorAppointByDateAndTime = async ({ doctorId, date, time }) => {
  return query(queries.GET_APPOINTMENTS_BY_DATE, [doctorId, date, time]);
};

exports.createNewZoomMeeting = async ({
  meetingId,
  meetingUUID,
  meetingTopic,
  joinUrl,
  startUrl,
  encryptedPassword,
}) => {
  return query(queries.CREATE_ZOOM_MEETING, [
    meetingId,
    meetingUUID,
    meetingTopic,
    joinUrl,
    startUrl,
    encryptedPassword,
  ]);
};
