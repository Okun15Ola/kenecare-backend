module.exports = {
  GET_ALL_CITIES: "CALL Sp_GetCities(?, ?)",
  GET_CITY_BY_ID: "CALL Sp_GetCityById(?)",
  GET_CITY_BY_NAME: "SELECT * FROM cities WHERE city_name = ? LIMIT 1",
  CREATE_CITY:
    "INSERT INTO cities (city_name,latitude,longitude,inputted_by) VALUES (?,?,?,?)",
  UPDATE_CITY_BY_ID:
    "UPDATE cities SET city_name = ? , latitude  =?, longitude = ? WHERE city_id = ?",
  UPDATE_CITY_STATUS_BY_ID: "UPDATE cities SET is_active = ? WHERE city_id = ?",
  DELETE_CITY_BY_ID: "DELETE FROM cities WHERE city_id = ?",
};
