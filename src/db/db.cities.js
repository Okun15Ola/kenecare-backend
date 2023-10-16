const { connectionPool } = require("./db.connection");

exports.getAllCities = () => {
  const sql = "SELECT * FROM city ORDER BY id DESC";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, (error, results) => {
      if (error) return reject(error);

      return resolve(results);
    });
  });
};
exports.getCityById = (cityId) => {
  const sql = "SELECT * FROM city WHERE id = ? LIMIT 1";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [cityId], (error, results) => {
      if (error) return reject(error);

      return resolve(results);
    });
  });
};
exports.createNewCity = (city) => {
  const sql = "SELECT * FROM city WHERE id = ? LIMIT 1";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [cityId], (error, results) => {
      if (error) return reject(error);

      return resolve(results);
    });
  });
};
