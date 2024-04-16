const { connectionPool } = require("./db.connection");

exports.getAppointmentPrescriptions = (appointmentId) => {
  const sql =
    "SELECT * FROM appointment_prescriptions WHERE appointment_id = ?";
  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [appointmentId], (err, result) => {
      if (err) return reject(err);

      return resolve(result);
    });
  });
};
exports.getAppointmentPrescriptionById = (prescriptionId) => {
  const sql =
    "SELECT * FROM appointment_prescriptions WHERE prescription_id = ?";
  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [prescriptionId], (err, result) => {
      if (err) return reject(err);

      return resolve(result[0]);
    });
  });
};
exports.getSimilarPrescription = ({
  appointmentId,
  diagnosis,
  medicines,
  comment,
}) => {
  const sql =
    "SELECT * FROM appointment_prescriptions WHERE appointment_id = ? AND diagnosis = ? AND medicines = ? AND doctors_comment = ? LIMIT 1";
  return new Promise((resolve, reject) => {
    connectionPool.query(
      sql,
      [appointmentId, diagnosis, medicines, comment],
      (err, result) => {
        if (err) return reject(err);

        return resolve(result[0]);
      }
    );
  });
};

exports.createAppointmentPrescriptions = ({
  appointmentId,
  diagnosis,
  medicines,
  comment,
}) => {
  const sql =
    "INSERT INTO appointment_prescriptions (appointment_id, diagnosis, medicines, doctors_comment) VALUES (?,?,?,?);";
  return new Promise((resolve, reject) => {
    connectionPool.query(
      sql,
      [appointmentId, diagnosis, medicines, comment],
      (err, result) => {
        if (err) return reject(err);

        return resolve(result);
      }
    );
  });
};

exports.updateAppointmentPrescriptions = ({
  appointmentId,
  prescriptionId,
  diagnosis,
  medicines,
  comment,
}) => {
  const sql =
    "UPDATE appointment_prescriptions SET diagnosis = ? , medicines = ? , doctors_comment = ? WHERE prescription_id = ? AND appointment_id = ? LIMIT 1;";
  return new Promise((resolve, reject) => {
    connectionPool.query(
      sql,
      [diagnosis, medicines, comment, prescriptionId, appointmentId],
      (err, result) => {
        if (err) return reject(err);

        return resolve(result);
      }
    );
  });
};
