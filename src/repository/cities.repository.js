const { query } = require("./db.connection");
const queries = require("./queries/cities.queries");

exports.getAllCities = async (limit, offset) => {
  const optimizedQuery = `${queries.GET_ALL_CITIES} LIMIT ${limit} OFFSET ${offset}`;
  return query(optimizedQuery);
};

exports.getCityById = async (id) => {
  const row = await query(queries.GET_CITY_BY_ID, [id]);
  return row[0];
};

exports.getCityByName = async (name) => {
  const row = await query(queries.GET_CITY_BY_NAME, [name]);
  return row[0];
};

exports.createNewCity = async (city) => {
  const { name, latitude, longitude, inputtedBy } = city;
  return query(queries.CREATE_CITY, [name, latitude, longitude, inputtedBy]);
};

exports.updateCityById = async (city) => {
  const { id, name, latitude, longitude } = city;
  return query(queries.UPDATE_CITY_BY_ID, [name, latitude, longitude, id]);
};

exports.updateCityStatusById = async ({ id, status }) => {
  return query(queries.UPDATE_CITY_STATUS_BY_ID, [status, id]);
};

exports.deleteCityById = async (id) => {
  return query(queries.DELETE_CITY_BY_ID, [id]);
};
