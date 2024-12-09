const { connectionPool } = require("./db.connection");

exports.createNewFollowUp = async ({
  appointmentId,
  followUpDate,
  followUpTime,
  followUpReason,
  followUpType,
  doctorId,
}) => {
  const sql =
    "INSERT INTO appointment_followup (appointment_id,followup_date, followup_time,reason,followup_type,doctor_id) VALUES (?,?,?,?,?,?);";
  return new Promise((resolve, reject) => {
    connectionPool.query(
      sql,
      [
        appointmentId,
        followUpDate,
        followUpTime,
        followUpReason,
        followUpType,
        doctorId,
      ],
      (error, results) => {
        if (error) return reject(error);

        return resolve(results);
      },
    );
  });
};

// exports.getAllDoctorFollowups = async (doctorId) => {
//   const sql = "SELECT * FROM appointment_followup WHERE doctor_id = ?";
//   return new Promise((resolve, reject) => {
//     connectionPool.query(sql, [doctorId], (error, results) => {
//       if (error) return reject(error);

//       return resolve(results);
//     });
//   });
// };

exports.getAppointmentFollowUps = async (appointmentId) => {
  const sql = "SELECT * FROM appointment_followup WHERE appointment_id = ?";
  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [appointmentId], (error, results) => {
      if (error) return reject(error);

      return resolve(results);
    });
  });
};
exports.getFollowUpById = async (followUpId) => {
  const sql =
    "SELECT * FROM appointment_followup WHERE followup_id = ? LIMIT 1";
  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [followUpId], (error, results) => {
      if (error) return reject(error);

      return resolve(results[0]);
    });
  });
};
exports.getDoctorFollowUpById = async ({ followUpId, doctorId }) => {
  const sql =
    "SELECT * FROM appointment_followup WHERE followup_id = ? AND doctor_id = ? LIMIT 1";
  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [followUpId, doctorId], (error, results) => {
      if (error) return reject(error);

      return resolve(results[0]);
    });
  });
};
exports.getFollowByDateAndTime = async ({ followUpDate, followUpTime }) => {
  const sql =
    "SELECT * FROM appointment_followup WHERE followup_date = ? AND followup_time = ? LIMIT 1";
  return new Promise((resolve, reject) => {
    connectionPool.query(
      sql,
      [followUpDate, followUpTime],
      (error, results) => {
        if (error) return reject(error);

        return resolve(results[0]);
      },
    );
  });
};

exports.getDoctorsFollowByDateAndTime = async ({
  doctorId,
  followUpDate,
  followUpTime,
}) => {
  const sql =
    "SELECT * FROM appointment_followup WHERE followup_date = ? AND followup_time = ? AND doctor_id = ? LIMIT 1";
  return new Promise((resolve, reject) => {
    connectionPool.query(
      sql,
      [followUpDate, followUpTime, doctorId],
      (error, results) => {
        if (error) return reject(error);

        return resolve(results[0]);
      },
    );
  });
};

exports.deleteAppointmentFollowUp = async ({ appointmentId, followUpId }) => {
  const sql =
    "DELETE FROM appointment_followup WHERE followup_id = ? AND appointment_id = ?";
  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [followUpId, appointmentId], (error, results) => {
      if (error) return reject(error);

      return resolve(results);
    });
  });
};
exports.updateAppointmentFollowUp = async ({
  appointmentId,
  followUpId,
  followUpDate,
  followUpTime,
  followUpReason,
  followUpType,
}) => {
  const sql =
    "UPDATE appointment_followup SET followup_date = ?, followup_time = ?, reason = ?, followup_type = ? WHERE followup_id = ? AND appointment_id = ?";
  return new Promise((resolve, reject) => {
    connectionPool.query(
      sql,
      [
        followUpDate,
        followUpTime,
        followUpReason,
        followUpType,
        followUpId,
        appointmentId,
      ],
      (error, results) => {
        if (error) return reject(error);

        return resolve(results);
      },
    );
  });
};
