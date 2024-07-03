const { connectionPool } = require("./db.connection");

exports.getAllDoctors = () => {
  const sqlQuery =
    "SELECT doctor_id, title,first_name,middle_name,last_name, gender,professional_summary,profile_pic_url, doctors.specialization_id,speciality_name, qualifications,consultation_fee, city_name,latitude,longitude, years_of_experience, is_profile_approved, doctors.user_id,  mobile_number, email, user_type, is_account_active FROM doctors INNER JOIN users ON doctors.user_id = users.user_id INNER JOIN medical_specialities ON doctors.specialization_id = medical_specialities.speciality_id INNER JOIN cities ON doctors.city_id = cities.city_id;";
  return new Promise((resolve, reject) => {
    connectionPool.query(sqlQuery, (err, result) => {
      if (err) return reject(err);

      return resolve(result);
    });
  });
};
exports.getDoctorByQuery = ({ locationId, query }) => {
  const sqlQuery =
    "SELECT doctor_id, title,first_name,middle_name,last_name, gender,professional_summary,profile_pic_url, doctors.specialization_id,speciality_name, qualifications,consultation_fee, city_name,latitude,longitude, years_of_experience, is_profile_approved, doctors.user_id,  mobile_number, email, user_type, is_account_active FROM doctors INNER JOIN users ON doctors.user_id = users.user_id INNER JOIN medical_specialities ON doctors.specialization_id = medical_specialities.speciality_id INNER JOIN cities ON doctors.city_id = cities.city_id WHERE doctors.city_id = ? AND (doctors.first_name LIKE ? OR doctors.middle_name LIKE ? OR doctors.last_name LIKE ? OR doctors.specialization_id,speciality_name LIKE ?);";
  return new Promise((resolve, reject) => {
    connectionPool.query(
      sqlQuery,
      [locationId, `%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`],
      (err, result) => {
        if (err) return reject(err);

        return resolve(result);
      },
    );
  });
};

exports.getDoctorById = (doctorId) => {
  const sql =
    "SELECT doctor_id, title,first_name,middle_name,last_name, gender,professional_summary,profile_pic_url, doctors.specialization_id,speciality_name, qualifications,consultation_fee, city_name, years_of_experience, is_profile_approved, doctors.user_id,  mobile_number, email, user_type, is_account_active FROM doctors INNER JOIN users ON doctors.user_id = users.user_id INNER JOIN medical_specialities ON doctors.specialization_id = medical_specialities.speciality_id INNER JOIN cities ON doctors.city_id = cities.city_id WHERE doctor_id = ? LIMIT 1;";
  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [doctorId], (err, result) => {
      if (err) return reject(err);
      return resolve(result[0]);
    });
  });
};

exports.getDoctorByUserId = (userId) => {
  const sql =
    "SELECT doctor_id, title,first_name,middle_name,last_name, gender,professional_summary,profile_pic_url, doctors.specialization_id,speciality_name, qualifications,consultation_fee, city_name, years_of_experience, is_profile_approved, doctors.user_id, notification_token, mobile_number, email, user_type, is_account_active FROM doctors INNER JOIN users ON doctors.user_id = users.user_id INNER JOIN medical_specialities ON doctors.specialization_id = medical_specialities.speciality_id INNER JOIN cities ON doctors.city_id = cities.city_id WHERE doctors.user_id = ? LIMIT 1;";
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
    "SELECT doctor_id, title,first_name,middle_name,last_name, gender,professional_summary,profile_pic_url, doctors.specialization_id,speciality_name, qualifications,consultation_fee, city_name, years_of_experience, is_profile_approved, doctors.user_id,  mobile_number, email, user_type, is_account_active FROM doctors INNER JOIN users ON doctors.user_id = users.user_id INNER JOIN medical_specialities ON doctors.specialization_id = medical_specialities.speciality_id INNER JOIN cities ON doctors.city_id = cities.city_id WHERE doctors.specialization_id = ?";
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

exports.getCouncilRegistrationByDoctorId = (doctorId) => {
  const sql =
    "SELECT council_registration_id, dcr.doctor_id,first_name,last_name, gender, doctors.specialization_id,speciality_name, profile_pic_url, council_name, registration_number, registration_year, registration_document_url, certificate_issued_date, certificate_expiry_date, registration_status, rejection_reason, fullname as 'verified_by' FROM doctors_council_registration as dcr INNER JOIN doctors on dcr.doctor_id = doctors.doctor_id INNER JOIN medical_councils on dcr.medical_council_id = medical_councils.council_id INNER JOIN medical_specialities on doctors.specialization_id = medical_specialities.speciality_id LEFT JOIN admins on dcr.verified_by = admins.admin_id WHERE dcr.doctor_id = ? LIMIT 1; ";
  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [doctorId], (err, result) => {
      if (err) return reject(err);

      return resolve(result[0]);
    });
  });
};

exports.getAllMedicalCouncilRegistration = () => {
  const sql =
    "SELECT council_registration_id,doctors_council_registration.doctor_id, first_name, last_name, doctors.specialization_id,speciality_name, profile_pic_url, council_name, years_of_experience,is_profile_approved, registration_number, registration_year, registration_document_url, certificate_issued_date, certificate_expiry_date,registration_status, rejection_reason, verified_by, doctors_council_registration.created_at FROM doctors_council_registration INNER JOIN medical_councils on doctors_council_registration.medical_council_id = medical_councils.council_id INNER JOIN doctors on doctors_council_registration.doctor_id = doctors.doctor_id INNER JOIN medical_specialities on doctors.specialization_id = medical_specialities.speciality_id;";
  return new Promise((resolve, reject) => {
    connectionPool.query(sql, (err, results) => {
      if (err) return reject(err);

      return resolve(results);
    });
  });
};
exports.getCouncilRegistrationById = (registrationId) => {
  const sql =
    "SELECT council_registration_id,doctors_council_registration.doctor_id, first_name, last_name, doctors.specialization_id,speciality_name, profile_pic_url, council_name, years_of_experience,is_profile_approved, registration_number, registration_year, registration_document_url, certificate_issued_date, certificate_expiry_date,registration_status, rejection_reason, verified_by, doctors_council_registration.created_at FROM doctors_council_registration INNER JOIN medical_councils on doctors_council_registration.medical_council_id = medical_councils.council_id INNER JOIN doctors on doctors_council_registration.doctor_id = doctors.doctor_id INNER JOIN medical_specialities on doctors.specialization_id = medical_specialities.speciality_id WHERE council_registration_id = ? LIMIT 1;";
  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [registrationId], (err, results) => {
      if (err) return reject(err);

      return resolve(results[0]);
    });
  });
};
exports.getCouncilRegistrationByRegNumber = (registrationNumber) => {
  const sql =
    "SELECT council_registration_id,doctors_council_registration.doctor_id, first_name, last_name, doctors.specialization_id,speciality_name, profile_pic_url, council_name, years_of_experience,is_profile_approved, registration_number, registration_year, registration_document_url, certificate_issued_date, certificate_expiry_date,registration_status, rejection_reason, verified_by, doctors_council_registration.created_at FROM doctors_council_registration INNER JOIN medical_councils on doctors_council_registration.medical_council_id = medical_councils.council_id INNER JOIN doctors on doctors_council_registration.doctor_id = doctors.doctor_id INNER JOIN medical_specialities on doctors.specialization_id = medical_specialities.speciality_id WHERE registration_number = ? LIMIT 1;";
  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [registrationNumber], (err, results) => {
      if (err) return reject(err);

      return resolve(results[0]);
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
      },
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
  fileName,
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
        fileName,
        certIssuedDate,
        certExpiryDate,
      ],
      (err, result) => {
        if (err) return reject(err);
        return resolve(result);
      },
    );
  });
};
exports.updateDoctorMedicalCouncilRegistration = ({
  registrationId,
  doctorId,
  councilId,
  regNumber,
  regYear,
  certIssuedDate,
  certExpiryDate,
  fileName,
}) => {
  const sql =
    "UPDATE doctors_council_registration SET medical_council_id = ?, registration_number = ? , registration_year = ?, registration_document_url = ?, certificate_issued_date = ? , certificate_expiry_date = ? WHERE council_registration_id = ? AND doctor_id = ? ;";
  return new Promise((resolve, reject) => {
    connectionPool.query(
      sql,
      [
        councilId,
        regNumber,
        regYear,
        fileName,
        certIssuedDate,
        certExpiryDate,
        registrationId,
        doctorId,
      ],
      (err, result) => {
        if (err) return reject(err);
        return resolve(result);
      },
    );
  });
};

exports.getDoctorMedicalCouncilRegistration = ({ doctorId }) => {
  const sql =
    "SELECT council_registration_id, dcr.doctor_id,first_name,last_name,gender, doctors.specialization_id,speciality_name, council_name, registration_number, registration_year, registration_document_url, certificate_issued_date, certificate_expiry_date, registration_status, rejection_reason, fullname as 'verified_by' FROM doctors_council_registration as dcr INNER JOIN doctors on dcr.doctor_id = doctors.doctor_id INNER JOIN medical_councils on dcr.medical_council_id = medical_councils.council_id INNER JOIN medical_specialities on doctors.specialization_id = medical_specialities.speciality_id LEFT JOIN admins on dcr.verified_by = admins.admin_id WHERE dcr.doctor_id = ? LIMIT 1; ";
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
      },
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
exports.approveDoctorProfileByDoctorId = ({ doctorId, approvedBy }) => {
  const sql =
    "UPDATE doctors SET is_profile_approved = 1, approved_by = ? WHERE doctor_id = ?";
  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [approvedBy, doctorId], (err, result) => {
      if (err) return reject(err);

      return resolve(result);
    });
  });
};
exports.approveDoctorMedicalCouncilRegistrationById = ({
  registrationId,
  approvedBy,
}) => {
  const sql =
    "UPDATE doctors_council_registration SET registration_status = 'approved', verified_by = ? WHERE council_registration_id = ?";
  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [approvedBy, registrationId], (err, result) => {
      if (err) return reject(err);
      return resolve(result);
    });
  });
};
exports.rejectDoctorMedicalCouncilRegistrationById = ({
  registrationId,
  rejectionReason,
  approvedBy,
}) => {
  const sql =
    "UPDATE doctors_council_registration SET registration_status = 'rejected', rejection_reason= ?, verified_by = ? WHERE council_registration_id = ?";
  return new Promise((resolve, reject) => {
    connectionPool.query(
      sql,
      [rejectionReason, approvedBy, registrationId],
      (err, result) => {
        if (err) return reject(err);
        return resolve(result);
      },
    );
  });
};
