const { query } = require("./db.connection");
const queries = require("./queries/users.queries");

exports.getAllUsers = async () => {
  return query(queries.GET_ALL_USERS);
};

exports.getUserByUsersType = async (typeId) => {
  return query(queries.GET_USERS_BY_TYPE, [typeId]);
};

exports.getUserById = async (userId) => {
  const result = await query(queries.GET_USER_BY_ID, [userId]);
  return result[0];
};

exports.getUserByMobileNumber = async (mobileNumber) => {
  const result = await query(queries.GET_USER_BY_MOBILE, [mobileNumber]);
  return result[0];
};

exports.getUserByEmail = async (email) => {
  const result = await query(queries.GET_USER_BY_EMAIL, [email]);
  return result[0];
};

exports.getUserByVerificationToken = async (token) => {
  const result = await query(queries.GET_USER_BY_VERIFICATION_TOKEN, [token]);
  return result[0];
};

exports.createNewUser = async ({
  mobileNumber,
  userType,
  vToken,
  password,
  referralCode,
  email,
}) => {
  const userEmail = email || null;
  return query(queries.CREATE_USER, [
    mobileNumber,
    userEmail,
    userType,
    password,
    vToken,
    referralCode,
  ]);
};

exports.updateUserEmailById = async ({ userId, email }) => {
  return query(queries.UPDATE_USER_EMAIL_BY_ID, [email, userId]);
};

exports.updateUserVerificationTokenById = async ({ userId, token }) => {
  return query(queries.UPDATE_USER_VERIFICATION_TOKEN_BY_ID, [token, userId]);
};

exports.updateUserNotificationToken = async ({ userId, notifToken }) => {
  return query(queries.UPDATE_USER_NOTIFICATION_TOKEN, [notifToken, userId]);
};

exports.updateUserMobileNumberById = async ({ userId, mobileNumber }) => {
  return query(queries.UPDATE_USER_MOBILE_BY_ID, [mobileNumber, userId]);
};

exports.updateUserAccountStatusById = async ({ userId, status }) => {
  return query(queries.UPDATE_USER_ACCOUNT_STATUS_BY_ID, [status, userId]);
};

exports.updateUserVerificationStatusByToken = async ({
  token,
  verificationStatus,
}) => {
  const timestamp = new Date();
  return query(queries.UPDATE_USER_VERIFICATION_STATUS_BY_TOKEN, [
    verificationStatus,
    timestamp,
    token,
  ]);
};

exports.updateUserPasswordById = async ({ userId, password }) => {
  return query(queries.UPDATE_USER_PASSWORD_BY_ID, [password, userId]);
};

exports.updateUserOnlineStatus = async ({ userId, status }) => {
  return query(queries.UPDATE_USER_ONLINE_STATUS, [status, userId]);
};

exports.deleteUserById = async (userId) => {
  return query(queries.DELETE_USER_BY_ID, [userId]);
};
