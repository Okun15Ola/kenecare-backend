const { connectionPool } = require("./db.connection");

exports.getAllCommonSymptoms = () => {
  const sql = "SELECT * FROM common_symptoms;";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, (error, results) => {
      if (error) return reject(error);

      return resolve(results);
    });
  });
};
exports.getCommonSymptomById = (symptonId) => {
  const sql = "SELECT * FROM common_symptoms WHERE symptom_id = ? LIMIT 1";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [symptonId], (error, results) => {
      if (error) return reject(error);

      return resolve(results[0]);
    });
  });
};
exports.createNewCommonSymptom = (sympton) => {
  const {
    symptomName,
    description,
    specialtyId,
    imageUrl,
    consultationFee,
    tags,
  } = sympton;
  const sql =
    "INSERT INTO common_symptoms (symptom_name,symptom_descriptions,speciality_id,image_url, general_consultation_fee,tags) VALUES (?,?,?,?,?,?)";

  return new Promise((resolve, reject) => {
    connectionPool.query(
      sql,
      [symptomName, description, specialtyId, imageUrl, consultationFee, tags],
      (error, results) => {
        if (error) return reject(error);

        return resolve(results);
      }
    );
  });
};
exports.updateCommonSymptomById = ({ symptomId, updatedSymptom }) => {
  const { symptomName, description, specialtyId, consultationFee, tags } =
    updatedSymptom;
  const sql =
    "UPDATE common_symptoms SET symptom_name = ?, symptom_descriptions, speciality_id = ?, general_consultation_fee = ?, tags = ? WHERE symptom_id = ?";

  return new Promise((resolve, reject) => {
    connectionPool.query(
      sql,
      [symptomName, description, specialtyId, consultationFee, tags, symptomId],
      (error, results) => {
        if (error) return reject(error);

        return resolve(results);
      }
    );
  });
};
exports.deleteCommonSymptomById = (symptomId) => {
  const sql = "DELETE FROM common_symptoms WHERE symptom_id = ?";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [symptomId], (error, results) => {
      if (error) return reject(error);

      return resolve(results);
    });
  });
};
