const { query } = require("./db.connection");
const queries = require("./queries/doctorFaqs.queries");

exports.getAllActiveDoctorFaqByDoctorId = async (doctorId, limit, offset) => {
  return query(queries.GET_ACTIVE_DOCTOR_FAQS, [doctorId, offset, limit]);
};

exports.getAllDoctorFaqByDoctorId = async (doctorId, limit, offset) => {
  return query(queries.GET_DOCTOR_FAQS, [doctorId, offset, limit]);
};

exports.getDoctorFaqById = async (id, doctorId) => {
  const row = await query(queries.GET_DOCTOR_FAQ, [id, doctorId]);
  return row[0];
};

exports.validateDoctorFaqId = async (id) => {
  const row = await query(queries.GET_FAQ_BY_ID, [id]);
  return row[0];
};

exports.createDoctorFaq = async (doctorId, question, answer) => {
  return query(queries.CREATE_DOCTOR_FAQ, [doctorId, question, answer]);
};

exports.updateDoctorFaq = async ({ question, answer, id, doctorId }) => {
  return query(queries.UPDATE_DOCTOR_FAQ, [question, answer, id, doctorId]);
};

exports.updateDoctorFaqStatus = async ({ isActive, id, doctorId }) => {
  return query(queries.UPDATE_DOCTOR_FAQ_STATUS, [isActive, id, doctorId]);
};

exports.deleteDoctorFaqById = async (id, doctorId) => {
  return query(queries.DELETE_DOCTOR_FAQ, [id, doctorId]);
};

exports.countDoctorFaq = async (doctorId) => {
  const row = await query(queries.COUNT_DOCTOR_FAQ, [doctorId]);
  return row[0];
};

exports.countDoctorActiveFaq = async (doctorId) => {
  const row = await query(queries.COUNT_DOCTOR_ACTIVE_FAQ, [doctorId]);
  return row[0];
};
