const { connectionPool } = require("./db.connection");

exports.getAllTestimonials = () => {
  const sql =
    "SELECT testimonial_id, first_name, last_name, profile_pic_url,testimonial_content,is_approved,is_active, fullname as 'approved_by' FROM patients_testimonial INNER JOIN patients on patients_testimonial.patient_id = patients.patient_id LEFT JOIN admins on patients_testimonial.approved_by = admins.admin_id;";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, (error, results) => {
      if (error) return reject(error);

      return resolve(results);
    });
  });
};

exports.getTestimonialById = (testimonialId) => {
  const sql =
    "SELECT testimonial_id, first_name, last_name, profile_pic_url,testimonial_content,is_approved,is_active, fullname as 'approved_by' FROM patients_testimonial INNER JOIN patients on patients_testimonial.patient_id = patients.patient_id LEFT JOIN admins on patients_testimonial.approved_by = admins.admin_id WHERE testimonial_id = ? LIMIT 1;";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [testimonialId], (error, result) => {
      if (error) return reject(error);

      return resolve(result[0]);
    });
  });
};

exports.createNewTestimonial = ({ patientId, content }) => {
  const sql =
    "INSERT INTO patients_testimonial (patient_id, testimonial_content) VALUES (?,?)";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [patientId, content], (error, results) => {
      if (error) return reject(error);

      return resolve(results);
    });
  });
};
exports.updateTestimonialById = ({ testimonialId, patientId, content }) => {
  const sql =
    "UPDATE patients_testimonial SET content = ?, WHERE testimonial_id = ? AND patient_id = ?";

  return new Promise((resolve, reject) => {
    connectionPool.query(
      sql,
      [content, testimonialId, patientId],
      (error, results) => {
        if (error) return reject(error);

        return resolve(results);
      }
    );
  });
};

exports.approveTestimonialById = ({ testimonialId, approvedBy }) => {
  const sql =
    "UPDATE patients_testimonial SET is_approved = 1, is_active = 1, approved_by = ? WHERE testimonial_id = ?";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [approvedBy, testimonialId], (error, results) => {
      if (error) return reject(error);

      return resolve(results);
    });
  });
};
exports.denyTestimonialById = ({ testimonialId, approvedBy }) => {
  const sql =
    "UPDATE patients_testimonial SET is_approved = 0, is_active = 0, approved_by = ? WHERE testimonial_id = ?";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [approvedBy, testimonialId], (error, results) => {
      if (error) return reject(error);

      return resolve(results);
    });
  });
};

// exports.deleteTestimonialById = (testimonialId) => {
//   const sql = "DELETE FROM patients_testimonial WHERE testimonial_id = ?";

//   return new Promise((resolve, reject) => {
//     connectionPool.query(sql, [testimonialId], (error, results) => {
//       if (error) return reject(error);

//       return resolve(results);
//     });
//   });
// };
