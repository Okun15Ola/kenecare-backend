const { connectionPool } = require("./db.connection");

exports.getAllDoctors = () => {
  const sqlQuery =
    "SELECT doctor_id, title,first_name,middle_name,last_name, gender,professional_summary,profile_pic_url, specialization_name, qualifications,consultation_fee, city_name,latitude,longitude, years_of_experience, is_profile_approved, doctors.user_id,  mobile_number, email, user_type, is_account_active FROM doctors INNER JOIN users ON doctors.user_id = users.user_id INNER JOIN specializations ON doctors.specialization_id = specializations.specialization_id INNER JOIN cities ON doctors.city_id = cities.city_id;";
  return new Promise((resolve, reject) => {
    connectionPool.query(sqlQuery, (err, result) => {
      if (err) return reject(err);

      return resolve(result);
    });
  });
};
exports.getDoctorByQuery = ({ locationId, query }) => {
  const sqlQuery =
    "SELECT doctor_id, title,first_name,middle_name,last_name, gender,professional_summary,profile_pic_url, specialization_name, qualifications,consultation_fee, city_name,latitude,longitude, years_of_experience, is_profile_approved, doctors.user_id,  mobile_number, email, user_type, is_account_active FROM doctors INNER JOIN users ON doctors.user_id = users.user_id INNER JOIN specializations ON doctors.specialization_id = specializations.specialization_id INNER JOIN cities ON doctors.city_id = cities.city_id WHERE doctors.city_id = ? AND (doctors.first_name LIKE ? OR doctors.middle_name LIKE ? OR doctors.last_name LIKE ? OR specialization_name LIKE ?);";
  return new Promise((resolve, reject) => {
    connectionPool.query(
      sqlQuery,
      [locationId, `%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`],
      (err, result) => {
        if (err) return reject(err);

        return resolve(result);
      }
    );
  });
};

exports.getDoctorById = (doctorId) => {
  const sql =
    "SELECT doctor_id, title,first_name,middle_name,last_name, gender,professional_summary,profile_pic_url, specialization_name, qualifications,consultation_fee, city_name, years_of_experience, is_profile_approved, doctors.user_id,  mobile_number, email, user_type, is_account_active FROM doctors INNER JOIN users ON doctors.user_id = users.user_id INNER JOIN specializations ON doctors.specialization_id = specializations.specialization_id INNER JOIN cities ON doctors.city_id = cities.city_id WHERE doctor_id = ? LIMIT 1;";
  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [doctorId], (err, result) => {
      if (err) return reject(err);
      return resolve(result[0]);
    });
  });
};

exports.getDoctorByUserId = (userId) => {
  const sql =
    "SELECT doctor_id, title,first_name,middle_name,last_name, gender,professional_summary,profile_pic_url, specialization_name, qualifications,consultation_fee, city_name, years_of_experience, is_profile_approved, doctors.user_id,  mobile_number, email, user_type, is_account_active FROM doctors INNER JOIN users ON doctors.user_id = users.user_id INNER JOIN specializations ON doctors.specialization_id = specializations.specialization_id INNER JOIN cities ON doctors.city_id = cities.city_id WHERE doctors.user_id = ? LIMIT 1;";
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

exports.getDoctorsBySpecializationId = (specializationId) => {
  const sql =
    "SELECT doctor_id, title,first_name,middle_name,last_name, gender,professional_summary,profile_pic_url, specialization_name, qualifications,consultation_fee, city_name, years_of_experience, is_profile_approved, doctors.user_id,  mobile_number, email, user_type, is_account_active FROM doctors INNER JOIN users ON doctors.user_id = users.user_id INNER JOIN specializations ON doctors.specialization_id = specializations.specialization_id INNER JOIN cities ON doctors.city_id = cities.city_id WHERE doctors.specialization_id = ?";
  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [specializationId], (err, results) => {
      if (err) return reject(err);
      return resolve(results);
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

exports.getDoctorsCouncilRegistrationById = (doctorId) => {
  const sql =
    "SELECT * FROM doctors_council_registration WHERE doctor_id = ? LIMIT 1;";
  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [doctorId], (err, result) => {
      if (err) return reject(err);

      return resolve(result[0]);
    });
  });
};
exports.createDoctor = ({
  userId,
  title,
  firstName,
  middleName,
  lastName,
  gender,
  professionalSummary,
  specializationId,
  qualifications,
  consultationFee,
  cityId,
  yearOfExperience,
}) => {
  const sql =
    "INSERT INTO doctors (user_id,title,first_name,middle_name,last_name,gender,professional_summary,specialization_id,qualifications,consultation_fee,city_id,years_of_experience) VALUES (?,?,?,?,?,?,?,?,?,?,?,?);";
  return new Promise((resolve, reject) => {
    connectionPool.query(
      sql,
      [
        userId,
        title,
        firstName,
        middleName,
        lastName,
        gender,
        professionalSummary,
        specializationId,
        qualifications,
        consultationFee,
        cityId,
        yearOfExperience,
      ],
      (err, result) => {
        if (err) return reject(err);
        return resolve(result);
      }
    );
  });
};

exports.createDoctorMedicalCouncilRegistration = ({
  doctorId,
  councilId,
  regNumber,
  regYear,
  certIssuedDate,
  certExpiryDate,
  filename,
}) => {
  const sql =
    "INSERT INTO doctors_council_registration (doctor_id, medical_council_id, registration_number, registration_year, registration_document_url, certificate_issued_date, certificate_expiry_date) VALUES (?,?,?,?,?,?,?);";
  return new Promise((resolve, reject) => {
    connectionPool.query(
      sql,
      [
        doctorId,
        councilId,
        regNumber,
        regYear,
        filename,
        certIssuedDate,
        certExpiryDate,
      ],
      (err, result) => {
        if (err) return reject(err);
        return resolve(result);
      }
    );
  });
};

exports.getDoctorMedicalCouncilRegistration = ({ doctorId }) => {
  const sql =
    "SELECT council_registration_id, dcr.doctor_id,first_name,last_name,gender, specialization_name, council_name, registration_number, registration_year, registration_document_url, certificate_issued_date, certificate_expiry_date, registration_status, rejection_reason, fullname as 'verified_by' FROM doctors_council_registration as dcr INNER JOIN doctors on dcr.doctor_id = doctors.doctor_id INNER JOIN medical_councils on dcr.medical_council_id = medical_councils.council_id INNER JOIN specializations on doctors.specialization_id = specializations.specialization_id LEFT JOIN admins on dcr.verified_by = admins.admin_id WHERE dcr.doctor_id = ? LIMIT 1; ";
  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [doctorId], (err, result) => {
      if (err) return reject(err);
      return resolve(result);
    });
  });
};

exports.updateDoctorById = ({
  doctorId,
  title,
  firstName,
  middleName,
  lastName,
  gender,
  professionalSummary,
  specializationId,
  qualifications,
  consultationFee,
  cityId,
  yearOfExperience,
}) => {
  const sql =
    "UPDATE doctors SET title = ? ,first_name = ?,middle_name = ?,last_name = ?,gender = ?,professional_summary = ?,specialization_id = ?,qualifications = ?,consultation_fee = ?,city_id = ?,years_of_experience = ? WHERE doctor_id = ?";
  return new Promise((resolve, reject) => {
    connectionPool.query(
      sql,
      [
        title,
        firstName,
        middleName,
        lastName,
        gender,
        professionalSummary,
        specializationId,
        qualifications,
        consultationFee,
        cityId,
        yearOfExperience,
        doctorId,
      ],
      (err, result) => {
        if (err) return reject(err);
        return resolve(result);
      }
    );
  });
};
exports.updateDoctorProfilePictureById = ({ doctorId, imageUrl }) => {
  const sql = "UPDATE doctors SET profile_pic_url = ? WHERE doctor_id = ?";
  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [imageUrl, doctorId], (err, result) => {
      if (err) return reject(err);
      return resolve(result);
    });
  });
};
