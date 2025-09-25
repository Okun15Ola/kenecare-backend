const { query } = require("./db.connection");
const queries = require("./queries/followUp.queries");

exports.createNewFollowUp = async ({
  appointmentId,
  followUpDate,
  followUpTime,
  followUpReason,
  followUpType,
  doctorId,
  followUpCount,
}) => {
  return query(queries.CREATE_APPOINTMENT_FOLLOW_UP, [
    appointmentId,
    followUpDate,
    followUpTime,
    followUpReason,
    followUpType,
    doctorId,
    followUpCount,
  ]);
};

exports.getAppointmentFollowUps = async (appointmentId) => {
  return query(queries.GET_ALL_APPOINTMENT_FOLLOW_UP_BY_APPOINTMENT_ID, [
    appointmentId,
  ]);
};

exports.getMaxFollowUpCount = async (appointmentId) => {
  const row = await query(queries.MAX_FOLLOW_UP_COUNT, [appointmentId]);
  return row[0];
};

exports.countDoctorFollowUp = async (doctorId) => {
  const result = await query(queries.COUNT_DOCTOR_FOLLOW_UPS, [doctorId]);
  return result[0];
};

exports.countPatientFollowUp = async (patientId) => {
  const result = await query(queries.COUNT_PATIENT_FOLLOW_UPS, [patientId]);
  return result[0];
};

exports.getFollowUpById = async (followUpId) => {
  const result = await query(queries.GET_APPOINTMENT_FOLLOW_UP_BY_ID, [
    followUpId,
  ]);
  return result[0];
};

exports.getDoctorFollowUpById = async ({ followUpId, doctorId }) => {
  const result = await query(
    queries.GET_APPOINTMENT_FOLLOW_UP_BY_ID_AND_DOCTOR,
    [followUpId, doctorId],
  );
  return result[0];
};

exports.getFollowByDateAndTime = async ({ followUpDate, followUpTime }) => {
  const result = await query(
    queries.GET_APPOINTMENT_FOLLOW_UP_BY_DATE_AND_TIME,
    [followUpDate, followUpTime],
  );
  return result[0];
};

exports.getDoctorsFollowByDateAndTime = async ({
  doctorId,
  followUpDate,
  followUpTime,
}) => {
  const result = await query(
    queries.GET_APPOINTMENT_FOLLOW_UP_BY_DATE_TIME_AND_DOCTOR,
    [followUpDate, followUpTime, doctorId],
  );
  return result[0];
};

exports.deleteAppointmentFollowUp = async (followUpId) => {
  return query(queries.DELETE_APPOINTMENT_FOLLOW_UP_BY_ID, [followUpId]);
};

exports.updateAppointmentFollowUp = async ({
  followUpId,
  appointmentId,
  followUpDate,
  followUpTime,
  followUpReason,
  followUpType,
}) => {
  return query(queries.UPDATE_APPOINTMENT_FOLLOW_UP_BY_ID, [
    followUpDate,
    followUpTime,
    followUpReason,
    followUpType,
    followUpId,
    appointmentId,
  ]);
};
