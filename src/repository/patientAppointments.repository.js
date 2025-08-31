const { query } = require("./db.connection");
const queries = require("./queries/patientAppointments.queries");

exports.getAllPatientAppointments = async ({ patientId, offset, limit }) => {
  const optimizedQuery = `${queries.GET_ALL_PATIENT_APPOINTMENTS} LIMIT ${limit} OFFSET ${offset}`;
  return query(optimizedQuery, [patientId]);
};

exports.countPatientAppointments = async ({ patientId }) => {
  const result = await query(queries.COUNT_PATIENT_APPOINTMENTS, [patientId]);
  return result[0];
};

exports.getPatientAppointmentsDashboardCount = async ({ patientId }) => {
  const result = await query(
    queries.GET_PATIENT_APPOINTMENTS_DASHBOARD_COUNTS,
    [patientId],
  );
  return result[0];
};

exports.getExisitingAppointments = async (doctorId, appointmentDate) => {
  return query(queries.GET_EXISITING_APPOINTMENTS, [doctorId, appointmentDate]);
};

exports.getPatientAppointmentById = async ({ patientId, appointmentId }) => {
  const result = await query(queries.GET_PATIENT_APPOINTMENT_BY_ID, [
    patientId,
    appointmentId,
  ]);
  return result[0];
};

exports.getPatientAppointmentByUUID = async ({
  patientId,
  appointmentUUID,
}) => {
  const result = await query(queries.GET_PATIENT_APPOINTMENT_BY_UUID, [
    patientId,
    appointmentUUID,
  ]);
  return result[0];
};

exports.getAppointmentByUUID = async (appointmentUUID) => {
  const result = await query(queries.GET_APPOINTMENT_BY_UUID, [
    appointmentUUID,
  ]);

  return result[0];
};

exports.getAppointmentByID = async (appointmentId) => {
  const result = await query(queries.GET_APPOINTMENT_BY_ID, [appointmentId]);
  return result[0];
};

exports.createNewPatientAppointment = async ({
  uuid,
  patientId,
  doctorId,
  appointmentType,
  patientName,
  patientNumber,
  specialtyId,
  symptoms,
  consultationFee,
  appointmentDate,
  appointmentTime,
}) => {
  return query(queries.CREATE_NEW_PATIENT_APPOINTMENT, [
    uuid,
    patientId,
    doctorId,
    appointmentType,
    patientName,
    patientNumber,
    specialtyId,
    symptoms,
    consultationFee,
    appointmentDate,
    appointmentTime,
  ]);
};

exports.deleteAppointmentById = async ({ appointmentId }) => {
  return query(queries.DELETE_APPOINTMENT_BY_ID, [appointmentId]);
};
