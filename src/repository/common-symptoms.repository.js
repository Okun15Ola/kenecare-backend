const { query } = require("./db.connection");
const queries = require("./queries/commonSymptoms.queries");

exports.getAllCommonSymptoms = async (limit, offset) => {
  return query(queries.GET_ALL_COMMON_SYMPTOMS, [offset, limit]);
};

exports.countCommonSymptom = async () => {
  const row = await query(queries.COUNT_COMMON_SYMPTOMS);
  return row[0];
};

exports.getCommonSymptomById = async (id) => {
  const row = await query(queries.GET_COMMON_SYMPTOMS_BY_ID, [id]);
  return row[0];
};

exports.getCommonSymptomByName = async (name) => {
  const row = await query(queries.GET_COMMON_SYMPTOMS_BY_NAME, [name]);
  return row[0];
};

exports.createNewCommonSymptom = async ({
  name,
  description,
  specialtyId,
  file,
  consultationFee,
  tags,
  inputtedBy,
}) => {
  return query(queries.CREATE_COMMON_SYMPTOMS, [
    name,
    description,
    specialtyId,
    file,
    consultationFee,
    tags,
    inputtedBy,
  ]);
};

exports.updateCommonSymptomById = async ({
  id,
  name,
  description,
  specialtyId,
  file,
  consultationFee,
  tags,
}) => {
  return query(queries.UPDATE_COMMON_SYMPTOMS_BY_ID, [
    name,
    description,
    specialtyId,
    file,
    consultationFee,
    tags,
    id,
  ]);
};

exports.deleteCommonSymptomById = async (id) => {
  return query(queries.DELETE_COMMON_SYMPTOMS_BY_ID, [id]);
};
