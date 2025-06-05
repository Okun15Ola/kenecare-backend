module.exports = {
  GET_ALL_MEDICAL_COUNCILS: "SELECT * FROM medical_councils;",
  GET_MEDICAL_COUNCIL_BY_ID:
    "SELECT * FROM medical_councils WHERE council_id = ? LIMIT 1",
  GET_MEDICAL_COUNCIL_BY_EMAIL:
    "SELECT * FROM medical_councils WHERE email = ? LIMIT 1",
  GET_MEDICAL_COUNCIL_BY_MOBILE:
    "SELECT * FROM medical_councils WHERE mobile_number = ? LIMIT 1",
  CREATE_MEDICAL_COUNCIL:
    "INSERT INTO medical_councils (council_name, email, mobile_number, address, inputted_by) VALUES (?,?,?,?,?)",
  UPDATE_MEDICAL_COUNCIL_BY_ID:
    "UPDATE medical_councils SET council_name = ?, email = ?, mobile_number = ?, address = ? WHERE council_id = ?",
  UPDATE_MEDICAL_COUNCIL_STATUS_BY_ID:
    "UPDATE medical_councils SET is_active = ? WHERE council_id = ?",
  DELETE_MEDICAL_COUNCIL_BY_ID:
    "DELETE FROM medical_councils WHERE council_id = ?",
};
