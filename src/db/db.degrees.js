const { connectionPool } = require("./db.connection");

exports.getAllDegrees = () => {
  const sql = "SELECT * FROM degree ORDER BY id DESC";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, (error, results) => {
      if (error) return reject(error);

      return resolve(results);
    });
  });
};
exports.getSpecializationById = (degreeId) => {
  const sql = "SELECT * FROM degree WHERE id = ? LIMIT 1";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [degreeId], (error, results) => {
      if (error) return reject(error);

      return resolve(results);
    });
  });
};
exports.createNewDegree = (degree) => {
  const { degreeName } = degree;
  const sql = "INSERT INTO degree (name) VALUES (?)";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [degreeName], (error, results) => {
      if (error) return reject(error);

      return resolve(results);
    });
  });
};
exports.updateDegreeById = (degreeId, updatedDegree) => {
  const { degreeName } = updatedDegree;
  const sql = "UPDATE degree SET name = ? WHERE id = ?";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [degreeName, degreeId], (error, results) => {
      if (error) return reject(error);

      return resolve(results);
    });
  });
};
exports.deleteDegreeById = (degreeId) => {
  const sql = "DELETE FROM degree WHERE id = ?";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [degreeId], (error, results) => {
      if (error) return reject(error);

      return resolve(results);
    });
  });
};
