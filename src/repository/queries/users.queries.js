module.exports = {
  GET_ALL_USERS:
    "SELECT * FROM users ORDER BY user_id WHERE deleted_at IS NULL ORDER BY created_at DESC;",
  GET_USERS_BY_TYPE:
    "SELECT * FROM users WHERE user_type = ? AND deleted_at IS NULL;",
  GET_USER_BY_ID: `
    SELECT user_id, mobile_number, email, user_type, is_verified, is_account_active, is_online, referral_code, is_2fa_enabled, notification_token, password
    FROM users WHERE user_id = ? AND deleted_at IS NULL LIMIT 1;
  `,
  GET_USER_BY_MOBILE:
    "SELECT * FROM users WHERE mobile_number = ? AND deleted_at IS NULL LIMIT 1;",
  GET_USER_BY_EMAIL:
    "SELECT * FROM users WHERE email = ? AND deleted_at IS NULL LIMIT 1;",
  GET_USER_BY_VERIFICATION_TOKEN:
    "SELECT * FROM users WHERE verification_token = ? AND deleted_at IS NULL LIMIT 1;",
  CREATE_USER: `
    INSERT INTO users (mobile_number, email, user_type, password, verification_token, referral_code, expiry_time)
    VALUES (?, ?, ?, ?, ?, ?, ?);
  `,
  UPDATE_USER_EMAIL_BY_ID:
    "UPDATE users SET email = ? WHERE user_id = ? AND deleted_at IS NULL;",
  UPDATE_USER_VERIFICATION_TOKEN_BY_ID:
    "UPDATE users SET verification_token = ?, expiry_time = ? WHERE user_id = ? AND deleted_at IS NULL;",
  UPDATE_USER_NOTIFICATION_TOKEN:
    "UPDATE users SET notification_token = ? WHERE user_id = ? AND deleted_at IS NULL;",
  UPDATE_USER_DEVICE_AND_NOTIFICATION_TOKEN: `
    UPDATE users SET device_notif_token = ?, notification_token = ? WHERE user_id = ? AND deleted_at IS NULL;
  `,
  UPDATE_USER_MOBILE_BY_ID:
    "UPDATE users SET mobile_number = ? WHERE user_id = ? AND deleted_at IS NULL;",
  UPDATE_USER_ACCOUNT_STATUS_BY_ID:
    "UPDATE users SET is_account_active = ? WHERE user_id = ? AND deleted_at IS NULL;",
  UPDATE_USER_VERIFICATION_STATUS_BY_TOKEN: `
    UPDATE users SET is_verified = ?, verification_token = NULL, is_online = 1, verified_at = ? WHERE verification_token = ? AND deleted_at IS NULL;
  `,
  UPDATE_USER_PASSWORD_BY_ID:
    "UPDATE users SET password = ? WHERE user_id = ? AND deleted_at IS NULL;",
  UPDATE_USER_ONLINE_STATUS:
    "UPDATE users SET is_online = ? WHERE user_id = ? AND deleted_at IS NULL;",
  SOFT_DELETE_USER_BY_ID:
    "UPDATE users SET deleted_at = ?, is_online = 0, is_verified = 0, is_active = 0, is_2fa_enabled = 0, verified_at = NULL WHERE user_id = ? AND deleted_at IS NULL;",
};
