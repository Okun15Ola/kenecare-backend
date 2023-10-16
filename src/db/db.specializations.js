const { connectionPool } = require("./db.connection");

exports.getAllSpecialization = () => {
  const sql = "SELECT * FROM sepcialization ORDER BY id DESC";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, (error, results) => {
      if (error) return reject(error);

      return resolve(results);
    });
  });
};
exports.getSpecializationById = (specializationId) => {
  const sql = "SELECT * FROM sepcialization WHERE id = ? LIMIT 1";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [specializationId], (error, results) => {
      if (error) return reject(error);

      return resolve(results);
    });
  });
};
exports.createNewSpecialization = (specialization) => {
  const { specializationName } = specialization;
  const sql = "INSERT INTO specilaization (name) VALUES (?)";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [specializationName], (error, results) => {
      if (error) return reject(error);

      return resolve(results);
    });
  });
};
exports.updateSpecializationById = (
  specializationId,
  updatedSpecialization
) => {
  const { specializationName } = updatedSpecialization;
  const sql = "UPDATE specilaization SET name = ? WHERE id = ?";

  return new Promise((resolve, reject) => {
    connectionPool.query(
      sql,
      [specializationName, specializationId],
      (error, results) => {
        if (error) return reject(error);

        return resolve(results);
      }
    );
  });
};
exports.deleteSpecializationById = (specializationId) => {
  const sql = "DELETE FROM specilaization WHERE id = ?";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [specializationId], (error, results) => {
      if (error) return reject(error);

      return resolve(results);
    });
  });
};
