const { query } = require("./db.connection");
const queries = require("./queries/specializations.queries");

exports.getAllSpecialization = async (limit, offset) => {
  const optimizedQuery = `${queries.GET_ALL_SPECIALIZATIONS} LIMIT ${limit} OFFSET ${offset}`;
  return query(optimizedQuery);
};

exports.countSpecialization = async () => {
  const result = await query(queries.COUNT_SPECIALIZATIONS);
  return result[0];
};

exports.getSpecializationById = async (specializationId) => {
  const result = await query(queries.GET_SPECIALIZATION_BY_ID, [
    specializationId,
  ]);
  return result[0];
};

exports.getSpecializationByName = async (specializationName) => {
  const result = await query(queries.GET_SPECIALIZATION_BY_NAME, [
    specializationName,
  ]);
  return result[0];
};

exports.createNewSpecialization = async ({
  name,
  description,
  imageUrl,
  inputtedBy,
}) => {
  return query(queries.CREATE_SPECIALIZATION, [
    name,
    description,
    imageUrl,
    inputtedBy,
  ]);
};

exports.updateSpecializationById = async ({ id, specialization }) => {
  const { name, description, imageUrl } = specialization;
  return query(queries.UPDATE_SPECIALIZATION_BY_ID, [
    name,
    description,
    imageUrl,
    id,
  ]);
};

exports.updateSpecializationStatusById = async ({
  specializationId,
  status,
}) => {
  return query(queries.UPDATE_SPECIALIZATION_STATUS_BY_ID, [
    status,
    specializationId,
  ]);
};

exports.deleteSpecializationById = async (specializationId) => {
  return query(queries.DELETE_SPECIALIZATION_BY_ID, [specializationId]);
};
