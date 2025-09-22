const { query } = require("./db.connection");
const queries = require("./queries/admins.queries");

exports.getAllAdmins = async (limit = 10, offset = 0) => {
  return query(queries.GET_ALL_ADMINS, [offset, limit]);
};

exports.getAdminById = async (adminId) => {
  const row = await query(queries.GET_ADMIN_BY_ID, [adminId]);
  return row[0];
};

exports.getAdminByMobileNumber = async (mobileNumber) => {
  const row = await query(queries.GET_ADMIN_BY_MOBILE, [mobileNumber]);
  return row[0];
};

exports.getAdminByEmail = async (email) => {
  const row = await query(queries.GET_ADMIN_BY_EMAIL, [email]);
  return row[0];
};

exports.createNewAdmin = async (admin) => {
  const { fullname, email, mobileNumber, password } = admin;
  return query(queries.CREATE_ADMIN, [fullname, email, mobileNumber, password]);
};

exports.updateAdminEmailById = async ({ adminId, email }) => {
  return query(queries.UPDATE_EMAIL_BY_ID, [email, adminId]);
};

exports.updateAdminMobileNumberById = async ({ adminId, mobileNumber }) => {
  return query(queries.UPDATE_MOBILE_BY_ID, [mobileNumber, adminId]);
};

exports.updateAdminAccountStatusById = async ({ id, status }) => {
  return query(queries.UPDATE_STATUS_BY_ID, [status, id]);
};

exports.updateUserVerificationStatusById = async ({
  userId,
  verificationStatus,
}) => {
  return query(queries.UPDATE_VERIFICATION_BY_ID, [verificationStatus, userId]);
};

exports.updateUserPasswordById = async ({ userId, password }) => {
  return query(queries.UPDATE_PASSWORD_BY_ID, [password, userId]);
};

exports.deleteUserById = async (userId) => {
  return query(queries.DELETE_USER_BY_ID, [userId]);
};
