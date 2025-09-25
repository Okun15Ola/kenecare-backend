module.exports = {
  GET_ALL_ADMINS:
    "SELECT a.*, COUNT(*) OVER() AS totalRows FROM admins a LIMIT ?,?",
  GET_ADMIN_BY_ID: "SELECT * FROM admins WHERE admin_id = ? LIMIT 1;",
  GET_ADMIN_BY_MOBILE: "SELECT * FROM admins WHERE mobile_number = ? LIMIT 1;",
  GET_ADMIN_BY_EMAIL: "SELECT * FROM admins WHERE email = ? LIMIT 1;",
  CREATE_ADMIN: "CALL Sp_InsertAdmin(?,?,?,?)",
  UPDATE_EMAIL_BY_ID: "UPDATE admins SET email = ? WHERE admin_id = ?;",
  UPDATE_MOBILE_BY_ID:
    "UPDATE admins SET mobile_number = ? WHERE admin_id = ?;",
  UPDATE_STATUS_BY_ID:
    "UPDATE admins SET is_account_active = ? WHERE admin_id = ?;",
  UPDATE_VERIFICATION_BY_ID:
    "UPDATE admins SET is_verified = ? WHERE user_id = ?;",
  UPDATE_PASSWORD_BY_ID: "UPDATE admins SET password = ? WHERE user_id = ?;",
  DELETE_USER_BY_ID: "DELETE FROM admins WHERE user_id = ?;",
};
