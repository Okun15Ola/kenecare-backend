const { connectionPool } = require("./db.connection");

exports.getAllSpecialties = () => {
  const sql = "SELECT * FROM medical_specialities ";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, (error, results) => {
      if (error) return reject(error);

      return resolve(results);
    });
  });
};
exports.getSpecialtiyById = (id) => {
  const sql =
    "SELECT * FROM medical_specialities WHERE speciality_id = ? LIMIT 1";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [id], (error, results) => {
      if (error) return reject(error);

      return resolve(results[0]);
    });
  });
};
exports.getSpecialtyByName = (name) => {
  const sql =
    "SELECT * FROM medical_specialities WHERE speciality_name = ? LIMIT 1";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [name], (error, results) => {
      if (error) return reject(error);

      return resolve(results[0]);
    });
  });
};
exports.createNewSpecialty = ({ name, description, image, inputtedBy }) => {
  const sql =
    "INSERT INTO medical_specialities (speciality_name, speciality_description, image_url,inputted_by ) VALUES (?,?,?,?)";

  return new Promise((resolve, reject) => {
    connectionPool.query(
      sql,
      [name, description, image, inputtedBy],
      (error, results) => {
        if (error) return reject(error);

        return resolve(results);
      }
    );
  });
};
exports.updateSpecialtiyById = ({ id, name, description, image }) => {
  const sql =
    "UPDATE medical_specialities SET speciality_name = ?, speciality_description = ?, image_url = ?  WHERE speciality_id = ?";

  return new Promise((resolve, reject) => {
    connectionPool.query(
      sql,
      [name, description, image, id],
      (error, results) => {
        if (error) return reject(error);

        return resolve(results);
      }
    );
  });
};
exports.updateSpecialtiyStatusById = ({ id, status }) => {
  const sql =
    "UPDATE medical_specialities SET is_active = ? WHERE speciality_id = ?";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [status, id], (error, results) => {
      if (error) return reject(error);

      return resolve(results);
    });
  });
};

exports.deleteSpecialtieById = (id) => {
  const sql = "DELETE FROM medical_specialities WHERE speciality_id = ?";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [id], (error, results) => {
      if (error) return reject(error);

      return resolve(results);
    });
  });
};
