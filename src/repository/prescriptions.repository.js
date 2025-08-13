const { query } = require("./db.connection");
const queries = require("./queries/prescriptions.queries");

exports.getAppointmentPrescriptions = async (appointmentId) => {
  const row = await query(queries.GET_PRESCRIPTIONS_BY_APPOINTMENT_ID, [
    appointmentId,
  ]);
  return row[0];
};

exports.getAppointmentPrescriptionById = async (prescriptionId) => {
  const result = await query(queries.GET_PRESCRIPTION_BY_ID, [prescriptionId]);
  return result[0];
};

exports.getSimilarPrescription = async ({
  appointmentId,
  diagnosis,
  medicines,
  comment,
}) => {
  const result = await query(queries.GET_SIMILAR_PRESCRIPTION, [
    appointmentId,
    diagnosis,
    medicines,
    comment,
  ]);
  return result[0];
};

exports.createAppointmentPrescriptions = async ({
  appointmentId,
  diagnosis,
  medicines,
  comment,
}) => {
  return query(queries.CREATE_PRESCRIPTION, [
    appointmentId,
    diagnosis,
    medicines,
    comment,
  ]);
};

exports.updateAppointmentPrescriptions = async ({
  appointmentId,
  prescriptionId,
  diagnosis,
  medicines,
  comment,
}) => {
  return query(queries.UPDATE_PRESCRIPTION, [
    diagnosis,
    medicines,
    comment,
    prescriptionId,
    appointmentId,
  ]);
};
