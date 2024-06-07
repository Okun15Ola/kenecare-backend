const { connectionPool } = require("./db.connection");

exports.getAllMedicalCouncils = () => {
  const sql = "SELECT * FROM medical_councils;";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, (error, results) => {
      if (error) return reject(error);

      return resolve(results);
    });
  });
};

exports.getMedicalCouncilById = (id) => {
  const sql = "SELECT * FROM medical_councils WHERE council_id = ? LIMIT 1";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [id], (error, results) => {
      if (error) return reject(error);

      return resolve(results[0]);
    });
  });
};
exports.getMedicalCouncilByEmail = (email) => {
  const sql = "SELECT * FROM medical_councils WHERE email = ? LIMIT 1";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [email], (error, results) => {
      if (error) return reject(error);

      return resolve(results[0]);
    });
  });
};
exports.getMedicalCouncilByMobileNumber = (mobileNumber) => {
  const sql = "SELECT * FROM medical_councils WHERE mobile_number = ? LIMIT 1";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [mobileNumber], (error, results) => {
      if (error) return reject(error);

      return resolve(results[0]);
    });
  });
};
exports.createNewMedicalCouncil = (council) => {
  const { name, email, mobileNumber, address, inputtedBy } = council;
  const sql =
    "INSERT INTO medical_councils (council_name,email,mobile_number,address,inputted_by) VALUES (?,?,?,?,?)";

  return new Promise((resolve, reject) => {
    connectionPool.query(
      sql,
      [name, email, mobileNumber, address, inputtedBy],
      (error, results) => {
        if (error) return reject(error);

        return resolve(results);
      },
    );
  });
};
exports.updateMedicalCouncilById = ({
  id,
  name,
  email,
  mobileNumber,
  address,
}) => {
  const sql =
    "UPDATE medical_councils SET council_name = ?, email = ?, mobile_number = ?, address = ? WHERE council_id = ?";

  return new Promise((resolve, reject) => {
    connectionPool.query(
      sql,
      [name, email, mobileNumber, address, id],
      (error, results) => {
        if (error) return reject(error);

        return resolve(results);
      },
    );
  });
};
exports.updateMedicalCouncilStatusById = ({ id, status }) => {
  const sql = "UPDATE medical_councils SET is_active = ? WHERE council_id = ?";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [status, id], (error, results) => {
      if (error) return reject(error);

      return resolve(results);
    });
  });
};
exports.deleteMedicalCouncilById = (id) => {
  const sql = "DELETE FROM medical_councils WHERE council_id = ?";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [id], (error, results) => {
      if (error) return reject(error);

      return resolve(results);
    });
  });
};
