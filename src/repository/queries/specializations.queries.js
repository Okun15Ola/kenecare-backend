module.exports = {
  GET_ALL_SPECIALIZATIONS: `
    SELECT * FROM specializations
  `,
  GET_SPECIALIZATION_BY_ID: `
    SELECT * FROM specializations WHERE specialization_id = ? LIMIT 1;
  `,
  GET_SPECIALIZATION_BY_NAME: `
    SELECT * FROM specializations WHERE specialization_name = ? LIMIT 1;
  `,
  CREATE_SPECIALIZATION: `
    INSERT INTO specializations (specialization_name, description, image_url, inputted_by)
    VALUES (?, ?, ?, ?);
  `,
  UPDATE_SPECIALIZATION_BY_ID: `
    UPDATE specializations
    SET specialization_name = ?, description = ?, image_url = ?
    WHERE specialization_id = ?;
  `,
  UPDATE_SPECIALIZATION_STATUS_BY_ID: `
    UPDATE specializations SET is_active = ? WHERE specialization_id = ?;
  `,
  DELETE_SPECIALIZATION_BY_ID: `
    DELETE FROM specializations WHERE specialization_id = ?;
  `,
};
