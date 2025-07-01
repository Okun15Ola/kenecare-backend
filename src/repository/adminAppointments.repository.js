const { query } = require("./db.connection");
const queries = require("./queries/adminAppointments.queries");

exports.getAllAppointments = async (limit, offset) => {
  const optimizedQuery = `${queries.GET_ALL_APPOINTMENTS} LIMIT ${limit} OFFSET ${offset}`;
  return query(optimizedQuery);
};

exports.getAppointments = async () => {
  return query(queries.GET_APPOINTMENTS);
};

exports.getAppointmentsByDoctorId = async ({
  page = 1,
  limit = 10,
  doctorId,
}) => {
  const newPage = page < 1 ? 1 : page;
  const newLimit = limit < 1 ? 10 : limit;
  const offset = (newPage - 1) * newLimit;
  const optimizedQuery = `${queries.GET_APPOINTMENTS_BY_DOCTOR_ID} LIMIT ${newLimit} OFFSET ${offset}`;
  return query(optimizedQuery, [doctorId]);
};

exports.getAppointmentById = async (appointmentId) => {
  const row = await query(queries.GET_APPOINTMENT_BY_ID, [appointmentId]);
  return row[0];
};
exports.getAppointmentByUUID = async (appointmentUUID) => {
  const row = await query(queries.GET_APPOINTMENT_BY_UUID, [appointmentUUID]);
  return row[0];
};
