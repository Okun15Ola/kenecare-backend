const { query } = require("./db.connection");
const queries = require("./queries/patientAppointments.queries");

exports.getAllPatientAppointments = async ({
  patientId,
  page = 1,
  limit = 20,
}) => {
  const newPage = page < 1 ? 1 : page;
  const newLimit = limit < 1 ? 10 : limit;
  const offset = (newPage - 1) * newLimit;

  const optimizedQuery = `${queries.GET_ALL_PATIENT_APPOINTMENTS} LIMIT ${newLimit} OFFSET ${offset}`;

  return query(optimizedQuery, [patientId]);
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
