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
exports.getCommonSymptomById = (id) => {
  const sql = "SELECT * FROM common_symptoms WHERE symptom_id = ? LIMIT 1";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [id], (error, results) => {
      if (error) return reject(error);

      return resolve(results[0]);
    });
  });
};
exports.createNewCommonSymptom = (symptom) => {
  const {
    name,
    description,
    specialtyId,
    imageUrl,
    consultationFee,
    tags,
    inputtedBy,
  } = symptom;
  const sql =
    "INSERT INTO common_symptoms (symptom_name,symptom_descriptions,speciality_id,image_url, general_consultation_fee,tags,inputted_by) VALUES (?,?,?,?,?,?,?)";

  return new Promise((resolve, reject) => {
    connectionPool.query(
      sql,
      [
        name,
        description,
        specialtyId,
        imageUrl,
        consultationFee,
        tags,
        inputtedBy,
      ],
      (error, results) => {
        if (error) return reject(error);

        return resolve(results);
      }
    );
  });
};
exports.updateCommonSymptomById = ({ id, symptom }) => {
  const { name, description, specialtyId, imageUrl, consultationFee, tags } =
    symptom;
  const sql =
    "UPDATE common_symptoms SET symptom_name = ?, symptom_descriptions, speciality_id = ?, image_url = ?, general_consultation_fee = ?, tags = ? WHERE symptom_id = ?";

  return new Promise((resolve, reject) => {
    connectionPool.query(
      sql,
      [name, description, specialtyId, imageUrl, consultationFee, tags, id],
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
