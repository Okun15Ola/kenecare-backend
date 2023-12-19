const { connectionPool } = require("./db.connection");

exports.getAllCities = () => {
  const sql = "CALL Sp_GetCities()";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, (error, results) => {
      if (error) return reject(error);

      const [cities] = results;
      return resolve(cities);
    });
  });
};
exports.getCityById = (id) => {
  const sql = "CALL Sp_GetCityById(?)";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [id], (error, results) => {
      if (error) return reject(error);

      const [result] = results;

      return resolve(result[0]);
    });
  });
};
exports.getCityByName = (name) => {
  const sql = "SELECT * FROM cities WHERE city_name = ? LIMIT 1";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [name], (error, results) => {
      if (error) return reject(error);

      return resolve(results[0]);
    });
  });
};
exports.createNewCity = (city) => {
  const { name, latitude, longitude, inputtedBy } = city;
  const sql =
    "INSERT INTO cities (city_name,latitude,longitude,inputted_by) VALUES (?,?,?,?)";

  return new Promise((resolve, reject) => {
    connectionPool.query(
      sql,
      [name, latitude, longitude, inputtedBy],
      (error, results) => {
        if (error) return reject(error);

        return resolve(results);
      }
    );
  });
};
exports.updateCityById = (city) => {
  const { id, name, latitude, longitude } = city;
  const sql =
    "UPDATE cities SET city_name = ? , latitude  =?, longitude = ? WHERE city_id = ?";

  return new Promise((resolve, reject) => {
    connectionPool.query(
      sql,
      [name, latitude, longitude, id],
      (error, results) => {
        if (error) return reject(error);

        return resolve(results);
      }
    );
  });
};
exports.updateCityStatusById = ({ id, status }) => {
  const sql = "UPDATE cities SET is_active = ? WHERE city_id = ?";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [status, id], (error, results) => {
      if (error) return reject(error);

      return resolve(results);
    });
  });
};
exports.deleteCityById = (id) => {
  const sql = "DELETE FROM cities WHERE city_id = ?";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [id], (error, results) => {
      if (error) return reject(error);

      return resolve(results);
    });
  });
};
