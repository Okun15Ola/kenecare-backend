const { connectionPool } = require("./db.connection");

exports.getAllCommonSymptoms = () => {
  const sql =
    "select symptom_id, symptom_name,symptom_descriptions,common_symptoms.image_url,general_consultation_fee, common_symptoms.tags, common_symptoms.is_active, common_symptoms.inputted_by, speciality_name from common_symptoms inner join medical_specialities on common_symptoms.speciality_id = medical_specialities.speciality_id;";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, (error, results) => {
      if (error) return reject(error);

      return resolve(results);
    });
  });
};
exports.getCommonSymptomById = (id) => {
  const sql = "SELECT * FROM common_symptoms WHERE symptom_id = ? LIMIT 1";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [id], (error, results) => {
      if (error) return reject(error);

      return resolve(results[0]);
    });
  });
};
exports.getCommonSymptomByName = (name) => {
  const sql = "SELECT * FROM common_symptoms WHERE symptom_name = ? LIMIT 1";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [name], (error, results) => {
      if (error) return reject(error);

      return resolve(results[0]);
    });
  });
};
exports.createNewCommonSymptom = ({
  name,
  description,
  specialtyId,
  file,
  consultationFee,
  tags,
  inputtedBy,
}) => {
  const sql =
    "INSERT INTO common_symptoms (symptom_name,symptom_descriptions,speciality_id,image_url, general_consultation_fee,tags,inputted_by) VALUES (?,?,?,?,?,?,?)";

  return new Promise((resolve, reject) => {
    connectionPool.query(
      sql,
      [name, description, specialtyId, file, consultationFee, tags, inputtedBy],
      (error, results) => {
        if (error) return reject(error);

        return resolve(results);
      }
    );
  });
};

exports.updateCommonSymptomById = ({
  id,
  name,
  description,
  specialtyId,
  file,
  consultationFee,
  tags,
}) => {
  const sql =
    "UPDATE common_symptoms SET symptom_name = ?, symptom_descriptions =?, speciality_id = ?,image_url=?,  general_consultation_fee = ?, tags = ? WHERE symptom_id = ?";

  return new Promise((resolve, reject) => {
    connectionPool.query(
      sql,
      [name, description, specialtyId, file, consultationFee, tags, id],
      (error, results) => {
        if (error) return reject(error);

        return resolve(results);
      }
    );
  });
};


exports.deleteCommonSymptomById = (id) => {
  const sql = "DELETE FROM common_symptoms WHERE symptom_id = ?";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [id], (error, results) => {
      if (error) return reject(error);

      return resolve(results);
    });
  });
};
