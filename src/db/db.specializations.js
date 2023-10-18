const { connectionPool } = require("./db.connection");

exports.getAllSpecialization = () => {
  const sql = "SELECT * FROM specializations;";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, (error, results) => {
      if (error) return reject(error);

      return resolve(results);
    });
  });
};

exports.getSpecializationById = (specializationId) => {
  const sql =
    "SELECT * FROM specializations WHERE specialization_id = ? LIMIT 1";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [specializationId], (error, result) => {
      if (error) return reject(error);

      return resolve(result[0]);
    });
  });
};

exports.getSpecializationByName = (specializationName) => {
  const sql =
    "SELECT * FROM specializations WHERE specialization_name= ? LIMIT 1";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [specializationName], (error, results) => {
      if (error) return reject(error);

      return resolve(results[0]);
    });
  });
};
exports.createNewSpecialization = (specialization) => {
  const { name, description, imageUrl, inputtedBy } = specialization;
  const sql =
    "INSERT INTO specializations (specialization_name,description,image_url, inputted_by) VALUES (?,?,?,?)";

  return new Promise((resolve, reject) => {
    connectionPool.query(
      sql,
      [name, description, imageUrl, inputtedBy],
      (error, results) => {
        if (error) return reject(error);

        return resolve(results);
      }
    );
  });
};
exports.updateSpecializationById = ({ id, specialization }) => {
  const { name, description, imageUrl } = specialization;
  const sql =
    "UPDATE specializations SET specialization_name = ?, description = ?, image_url = ? WHERE specialization_id = ?";

  return new Promise((resolve, reject) => {
    connectionPool.query(
      sql,
      [name, description, imageUrl, id],
      (error, results) => {
        if (error) return reject(error);

        return resolve(results);
      }
    );
  });
};

exports.updateSpecializationStatusById = ({ specializationId, status }) => {
  const sql =
    "UPDATE specializations SET is_active = ? WHERE specialization_id = ?";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [status, specializationId], (error, results) => {
      if (error) return reject(error);

      return resolve(results);
    });
  });
};
exports.deleteSpecializationById = (specializationId) => {
  const sql = "DELETE FROM specializations WHERE specialization_id = ?";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [specializationId], (error, results) => {
      if (error) return reject(error);

      return resolve(results);
    });
  });
};
