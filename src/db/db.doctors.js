const { connectionPool } = require("./db.connection");

exports.getAllDoctors = () => {
  const sqlQuery = "SELECT * FROM doctors ;";
  return new Promise((resolve, reject) => {
    connectionPool.query(sqlQuery, (err, result) => {
      if (err) return reject(err);

      return resolve(result);
    });
  });
};

exports.getDoctorById = (doctorId) => {
  const sql = "SELECT * FROM doctors WHERE doctor_id = ? LIMIT 1;";
  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [doctorId], (err, result) => {
      if (err) return reject(err);
      return resolve(result[0]);
    });
  });
};


exports.getDoctorByUserId = (userId) => {
  const sql = "SELECT * FROM doctors WHERE user_id = ?;";
  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [userId], (err, result) => {
      if (err) return reject(err);
      return resolve(result[0]);
    });
  });
};

exports.getDoctorsByCityId = (cityId) => {
  const sql = "SELECT * FROM doctors WHERE city_id = ?;";
  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [cityId], (err, result) => {
      if (err) return reject(err);
      return resolve(result);
    });
  });
};
exports.getDoctorsBySpecialityId = (specialityId) => {
  const sql = "SELECT * FROM doctors WHERE speciality_id = ?;";
  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [specialityId], (err, result) => {
      if (err) return reject(err);
      return resolve(result);
    });
  });
};

exports.getDoctorsBySpecializationId = (specializationId) => {
  const sql = "SELECT * FROM doctors WHERE specialization_id = ?;";
  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [specializationId], (err, result) => {
      if (err) return reject(err);
      return resolve(result);
    });
  });
};

exports.getDoctorsByHospitalId = (hospitalId) => {
  const sql = "SELECT * FROM doctors WHERE hospital_id = ?;";
  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [hospitalId], (err, result) => {
      if (err) return reject(err);
      return resolve(result);
    });
  });
};

exports.getDoctorsCouncilRegistrationById = (hospitalId) => {
  const sql = "SELECT * FROM doctors WHERE hospital_id = ?;";
  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [hospitalId], (err, result) => {
      if (err) return reject(err);
      return resolve(result);
    });
  });
};
