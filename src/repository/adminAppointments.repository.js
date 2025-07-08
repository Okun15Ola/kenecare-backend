const { query } = require("./db.connection");
const queries = require("./queries/adminAppointments.queries");

exports.getAllAppointments = async (limit, offset) => {
  const optimizedQuery =
    limit && offset
      ? `${queries.GET_ALL_APPOINTMENTS} LIMIT ${limit} OFFSET ${offset}`
      : queries.GET_ALL_APPOINTMENTS;

  return query(optimizedQuery);
};

exports.getAppointments = async (limit, offset) => {
  const optimizedQuery =
    limit && offset
      ? `${queries.GET_APPOINTMENTS} LIMIT ${limit} OFFSET ${offset}`
      : queries.GET_APPOINTMENTS;
  return query(optimizedQuery);
};

exports.getAppointmentsByDoctorId = async ({ limit, offset, doctorId }) => {
  const optimizedQuery = `${queries.GET_APPOINTMENTS_BY_DOCTOR_ID} LIMIT ${limit} OFFSET ${offset}`;
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
