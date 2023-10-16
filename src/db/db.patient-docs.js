const { connectionPool } = require("./db.connection");

exports.getAllPatientDocs = () => {
  const sql = "SELECT * FROM sepcialization ORDER BY id DESC";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, (error, results) => {
      if (error) return reject(error);

      return resolve(results);
    });
  });
};
exports.getPatientDocById = (specializationId) => {
  const sql = "SELECT * FROM sepcialization WHERE id = ? LIMIT 1";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [specializationId], (error, results) => {
      if (error) return reject(error);

      return resolve(results);
    });
  });
};
exports.getPatientDocByPatientId = (specializationId) => {
  const sql = "SELECT * FROM sepcialization WHERE id = ? LIMIT 1";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [specializationId], (error, results) => {
      if (error) return reject(error);

      return resolve(results);
    });
  });
};
exports.createNewPatientDoc = (specialization) => {
  const { specializationName } = specialization;
  const sql = "INSERT INTO pateint_docs (name) VALUES (?)";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [specializationName], (error, results) => {
      if (error) return reject(error);

      return resolve(results);
    });
  });
};
exports.updatePatientDocById = (
  specializationId,
  updatedSpecialization
) => {
  const { specializationName } = updatedSpecialization;
  const sql = "UPDATE pateint_docs SET name = ? WHERE id = ?";

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
exports.deletePatientDocById = (specializationId) => {
  const sql = "DELETE FROM pateint_docs WHERE id = ?";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [specializationId], (error, results) => {
      if (error) return reject(error);

      return resolve(results);
    });
  });
};
