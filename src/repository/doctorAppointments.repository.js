const { query } = require("./db.connection");
const queries = require("./queries/doctorAppointments.queries");

exports.getAppointmentsByDoctorId = async ({ doctorId, offset, limit }) => {
  return query(queries.GET_APPOINTMENTS_BY_DOCTOR_ID, [
    doctorId,
    offset,
    limit,
  ]);
};

exports.getDoctorsPendingAppointmentsForToday = async () => {
  return query(queries.GET_ALL_DOCTORS_PENDING_APPOINTMENTS_TODAY);
};

exports.getDoctorsApprovedAppointmentsForToday = async () => {
  return query(queries.GET_ALL_DOCTORS_APPROVED_APPOINTMENTS_TODAY);
};

exports.countDoctorAppointments = async ({ doctorId }) => {
  const row = await query(queries.COUNT_DOCTOR_APPOINTMENTS_BY_ID, [doctorId]);
  return row[0];
};

exports.getDoctorAppointmentsDashboardMetrics = async ({ doctorId }) => {
  const result = await query(
    queries.GET_DOCTOR_APPOINTMENTS_DASHBOARD_METRICS,
    [doctorId],
  );
  return result[0];
};

exports.getDoctorAppointmentsDashboardMonthlyMetrics = async ({ doctorId }) => {
  return query(queries.GET_DOCTOR_MONTHLY_APPOINTMENT_METRICS, [doctorId]);
};

exports.getDoctorAppointmentById = async ({ doctorId, appointmentId }) => {
  const row = await query(queries.GET_DOCTOR_APPOINTMENT_BY_ID, [
    doctorId,
    appointmentId,
  ]);
  return row[0];
};
exports.getDoctorAppointmentByUuid = async ({ doctorId, appointmentUuid }) => {
  const row = await query(queries.GET_DOCTOR_APPOINTMENT_BY_UUID, [
    doctorId,
    appointmentUuid,
  ]);
  return row[0];
};

exports.getAppointmentById = async (appointmentId) => {
  const row = await query(queries.GET_APPOINTMENT_BY_ID, [appointmentId]);
  return row[0];
};

exports.getAppointmentByMeetingId = async (meetingId) => {
  const row = await query(queries.GET_APPOINTMENT_BY_MEETING_ID, [meetingId]);
  return row[0];
};

exports.approveDoctorAppointmentById = async ({ doctorId, appointmentId }) => {
  return query(queries.APPROVE_APPOINTMENT, [appointmentId, doctorId]);
};

exports.updateDoctorAppointmentMeetingId = async ({
  doctorId,
  appointmentId,
  meetingId,
}) => {
  return query(queries.UPDATE_MEETING_ID, [meetingId, appointmentId, doctorId]);
};

exports.updateDoctorAppointmentStartTime = async ({
  appointmentId,
  startTime,
}) => {
  return query(queries.UPDATE_START_TIME, [startTime, appointmentId]);
};

exports.updateDoctorAppointmentEndTime = async ({ appointmentId, endTime }) => {
  return query(queries.UPDATE_END_TIME, [endTime, appointmentId]);
};

exports.cancelDoctorAppointmentById = async ({
  doctorId,
  appointmentId,
  cancelReason,
}) => {
  return query(queries.CANCEL_APPOINTMENT, [
    cancelReason,
    appointmentId,
    doctorId,
  ]);
};

exports.batchUpdateEndTimeForOpenAppointments = async (endTime) => {
  return query(queries.BATCH_UPDATE_END_TIME, [endTime]);
};

exports.postponeDoctorAppointmentById = async ({
  doctorId,
  appointmentId,
  postponedReason,
  postponedDate,
  postponedTime,
}) => {
  const newAppointmentDate = postponedDate;
  return query(queries.POSTPONE_APPOINTMENT, [
    postponedReason,
    postponedDate,
    newAppointmentDate,
    postponedTime,
    appointmentId,
    doctorId,
  ]);
};

exports.getDoctorAppointByDate = async ({
  doctorId,
  startDate,
  endDate,
  limit,
  offset,
}) => {
  return query(queries.GET_APPOINTMENTS_BY_DATE, [
    startDate,
    endDate,
    doctorId,
    offset,
    limit,
  ]);
};

exports.countDoctorAppointmentsByDate = async ({
  doctorId,
  startDate,
  endDate,
}) => {
  const row = await query(queries.COUNT_APPOINTMENTS_BY_DATE, [
    startDate,
    endDate,
    doctorId,
  ]);
  return row[0];
};

exports.getDoctorAppointByDateAndTime = async ({ doctorId, date, time }) => {
  const row = await query(queries.GET_APPOINTMENT_BY_DATE_AND_TIME, [
    date,
    time,
    doctorId,
  ]);
  return row[0];
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

exports.getDoctorTodayAppointments = async (doctorId) => {
  return query(queries.GET_ALL_DOCTORS_APPOINTMENTS_TODAY, [doctorId]);
};

exports.getDoctorAppointmentsDateRange = async (
  doctorId,
  startDate,
  endDate,
) => {
  return query(queries.GET_DOCTOR_APPOINTMENTS_DATE_RANGE, [
    doctorId,
    startDate,
    endDate,
  ]);
};
