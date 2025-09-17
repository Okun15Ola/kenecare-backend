module.exports = {
  GET_ALL_DEGREES: "SELECT * FROM degree ORDER BY id DESC",
  GET_DEGREES_BY_ID: "SELECT * FROM degree WHERE id = ? LIMIT 1",
  CREATE_DEGREES: "INSERT INTO degree (name) VALUES (?)",
  UPDATE_DEGREES_BY_ID: "UPDATE degree SET name = ? WHERE id = ?",
  DELETE_DEGREES_BY_ID: "DELETE FROM degree WHERE id = ?",
};
