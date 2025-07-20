const { query } = require("./db.connection");
const queries = require("./queries/specialities.queries");

exports.getAllSpecialties = async (limit, offset) => {
  const optimizedQuery = `${queries.GET_ALL_SPECIALTIES} LIMIT ${limit} OFFSET ${offset}`;
  return query(optimizedQuery);
};

exports.getSpecialtiyCount = async () => {
  const result = await query(queries.COUNT_SPECIALITY);
  return result[0];
};

exports.getSpecialtiyById = async (id) => {
  const result = await query(queries.GET_SPECIALTY_BY_ID, [id]);
  return result[0];
};

exports.getSpecialtyByName = async (name) => {
  const result = await query(queries.GET_SPECIALTY_BY_NAME, [name]);
  return result[0];
};

exports.createNewSpecialty = async ({
  name,
  description,
  image,
  inputtedBy,
}) => {
  return query(queries.CREATE_SPECIALTY, [
    name,
    description,
    image,
    inputtedBy,
  ]);
};

exports.updateSpecialtiyById = async ({ id, name, description, image }) => {
  return query(queries.UPDATE_SPECIALTY_BY_ID, [name, description, image, id]);
};

exports.updateSpecialtiyStatusById = async ({ id, status }) => {
  return query(queries.UPDATE_SPECIALTY_STATUS_BY_ID, [status, id]);
};

exports.deleteSpecialtieById = async (id) => {
  return query(queries.DELETE_SPECIALTY_BY_ID, [id]);
};
