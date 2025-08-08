const queries = require("./queries/appointmentFeedbacks.queries");
const { query } = require("./db.connection");

exports.addAppointmentFeedback = async (appointmentId, feedback) => {
  return query(queries.ADD_APPOINTMENT_FEEDBACK, [appointmentId, feedback]);
};

exports.getAppointmentFeedback = async (appointmentId) => {
  const row = await query(queries.GET_APPOINTMENT_FEEDBACK, [appointmentId]);
  return row[0];
};
