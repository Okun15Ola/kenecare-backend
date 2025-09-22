const { query } = require("./db.connection");
const queries = require("./queries/adminAppointments.queries");

exports.getAllAppointments = async (limit, offset) => {
  return query(queries.GET_ALL_APPOINTMENTS, [offset, limit]);
};

exports.getAppointments = async (limit, offset) => {
  return query(queries.GET_APPOINTMENTS, [offset, limit]);
};

exports.countAppointments = async () => {
  const row = await query(queries.COUNT_APPOINTMENTS);
  return row[0];
};

exports.countDoctorAppointments = async (doctorId) => {
  const row = await query(queries.COUNT_DOCTORS_APPOINTMENTS, [doctorId]);
  return row[0];
};

exports.getAppointmentsByDoctorId = async (limit, offset, doctorId) => {
  return query(queries.GET_APPOINTMENTS_BY_DOCTOR_ID, [
    doctorId,
    offset,
    limit,
  ]);
};

exports.getAppointmentById = async (appointmentId) => {
  const row = await query(queries.GET_APPOINTMENT_BY_ID, [appointmentId]);
  return row[0];
};
exports.getAppointmentByUUID = async (appointmentUUID) => {
  const row = await query(queries.GET_APPOINTMENT_BY_UUID, [appointmentUUID]);
  return row[0];
};
