const { query } = require("./db.connection");
const queries = require("./queries/degrees.queries");

exports.getAllDegrees = async (limit, offset) => {
  const optimizedQuery = `${queries.GET_ALL_DEGREES} LIMIT ${limit} OFFSET ${offset}`;
  return query(optimizedQuery);
};

exports.getSpecializationById = async (degreeId) => {
  const row = await query(queries.GET_DEGREES_BY_ID, [degreeId]);
  return row[0];
};

exports.createNewDegree = async (degree) => {
  return query(queries.CREATE_DEGREES, [degree]);
};

exports.updateDegreeById = async (degreeId, updatedDegree) => {
  return query(queries.UPDATE_DEGREES_BY_ID, [updatedDegree, degreeId]);
};

exports.deleteDegreeById = async (degreeId) => {
  return query(queries.DELETE_DEGREES_BY_ID, [degreeId]);
};
