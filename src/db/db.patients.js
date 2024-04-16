const { connectionPool } = require("./db.connection");

exports.getAllPatients = () => {
  const sql =
    "SELECT patient_id, title, first_name, middle_name, last_name, gender, profile_pic_url, dob, mobile_number, email, user_type, is_account_active, is_online FROM patients INNER JOIN users on patients.user_id = users.user_id;";
  return new Promise((resolve, reject) => {
    connectionPool.query(sql, (error, result) => {
      if (error) return reject(error);

      return resolve(result);
    });
  });
};

exports.getPatientById = (id) => {
  const sql =
    "SELECT patient_id, title, first_name,middle_name,last_name, gender,profile_pic_url, dob,booked_first_appointment, mobile_number,email,  user_type, is_account_active, is_online FROM patients INNER JOIN users ON patients.user_id = users.user_id  WHERE patient_id = ? LIMIT 1;";
  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [id], (error, result) => {
      if (error) return reject(error);
      return resolve(result[0]);
    });
  });
};

exports.getPatientByUserId = (userId) => {
  const sql =
    "SELECT patient_id, first_name,middle_name,last_name, gender,dob,booked_first_appointment, patients.user_id,  mobile_number,email, profile_pic_url, user_type, is_account_active FROM patients INNER JOIN users ON patients.user_id = users.user_id  WHERE patients.user_id = ? LIMIT 1;";
  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [userId], (err, result) => {
      if (err) return reject(err);
      return resolve(result[0]);
    });
  });
};

exports.getPatientsByCityId = (cityId) => {
  const sql = "SELECT * FROM doctors WHERE city_id = ?;";
  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [cityId], (err, result) => {
      if (err) return reject(err);
      return resolve(result);
    });
  });
};

exports.createPatient = ({
  userId,
  firstName,
  middleName,
  lastName,
  gender,
  dateOfBirth,
}) => {
  const sql =
    "INSERT INTO patients (user_id,first_name,middle_name,last_name,gender,dob) VALUES (?,?,?,?,?,?);";
  return new Promise((resolve, reject) => {
    connectionPool.query(
      sql,
      [userId, firstName, middleName, lastName, gender, dateOfBirth],
      (err, result) => {
        if (err) return reject(err);
        return resolve(result);
      }
    );
  });
};
exports.createPatientMedicalInfo = ({
  patientId,
  height,
  weight,
  allergies,
  isDisabled,
  disabilityDesc,
  tobaccoIntake,
  tobaccoIntakeFreq,
  alcoholIntake,
  alcoholIntakeFreq,
  caffineIntake,
  caffineIntakeFreq,
}) => {
  const sql =
    "INSERT INTO patient_medical_history (patient_id,height, weight,allergies,is_patient_disabled,disability_description,tobacco_use, tobacco_use_frequency, alcohol_use, alcohol_use_frequency, caffine_use, caffine_use_frequency) VALUES (?,?,?,?,?,?,?,?,?,?,?,?);";
  return new Promise((resolve, reject) => {
    connectionPool.query(
      sql,
      [
        patientId,
        height,
        weight,
        allergies,
        isDisabled,
        disabilityDesc,
        tobaccoIntake,
        tobaccoIntakeFreq,
        alcoholIntake,
        alcoholIntakeFreq,
        caffineIntake,
        caffineIntakeFreq,
      ],
      (err, result) => {
        if (err) return reject(err);
        return resolve(result);
      }
    );
  });
};

exports.getPatientMedicalInfoByPatientId = (patientId) => {
  const sql =
    "SELECT * from patient_medical_history WHERE patient_id = ? LIMIT 1;";
  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [patientId], (err, result) => {
      if (err) return reject(err);
      return resolve(result[0]);
    });
  });
};

exports.updatePatientById = ({
  patientId,
  firstName,
  middleName,
  lastName,
  gender,
  dateOfBirth,
}) => {
  const sql =
    "UPDATE patients SET first_name = ?,middle_name = ?,last_name = ?,gender = ?,dob = ? WHERE patient_id = ?";
  return new Promise((resolve, reject) => {
    connectionPool.query(
      sql,
      [firstName, middleName, lastName, gender, dateOfBirth, patientId],
      (err, result) => {
        if (err) return reject(err);
        return resolve(result);
      }
    );
  });
};
exports.updatePatientFirstAppointmentStatus = (patientId) => {
  const sql =
    "UPDATE patients SET booked_first_appointment = 1 WHERE patient_id = ?";
  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [patientId], (err, result) => {
      if (err) return reject(err);
      return resolve(result);
    });
  });
};
exports.updatePatientProfilePictureByUserId = ({ userId, imageUrl }) => {
  const sql = "UPDATE patients SET profile_pic_url = ? WHERE user_id = ?";
  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [imageUrl, userId], (err, result) => {
      if (err) return reject(err);
      return resolve(result);
    });
  });
};

exports.updatePatientMedicalHistory = ({
  patientId,
  height,
  weight,
  allergies,
  isDisabled,
  disabilityDesc,
  tobaccoIntake,
  tobaccoIntakeFreq,
  alcoholIntake,
  alcoholIntakeFreq,
  caffineIntake,
  caffineIntakeFreq,
}) => {
  const sql =
    "UPDATE patient_medical_history  SET height = ?, weight =? ,allergies =? ,is_patient_disabled=? ,disability_description=? ,tobacco_use=? , tobacco_use_frequency=? , alcohol_use=? , alcohol_use_frequency=? , caffine_use=? , caffine_use_frequency=? WHERE patient_id = ?;";
  return new Promise((resolve, reject) => {
    connectionPool.query(
      sql,
      [
        height,
        weight,
        allergies,
        isDisabled,
        disabilityDesc,
        tobaccoIntake,
        tobaccoIntakeFreq,
        alcoholIntake,
        alcoholIntakeFreq,
        caffineIntake,
        caffineIntakeFreq,
        patientId,
      ],
      (err, result) => {
        if (err) return reject(err);
        return resolve(result);
      }
    );
  });
};
