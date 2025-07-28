module.exports = {
  ADD_API_KEY:
    "INSERT INTO api_keys(key_uuid, client_id, api_key, api_secret, expires_at) VALUES(?, ?, ?, ?, ?);",
  UPDATE_LAST_USED:
    "UPDATE api_keys SET last_used_at = NOW() WHERE api_key = ?;",
  DEACTIVATE_KEY:
    "UPDATE api_keys SET is_active = 0 WHERE key_uuid = ? OR key_id = ?;",
  EXTEND_EXPIRATION:
    "UPDATE api_keys SET expires_at = ? WHERE key_uuid = ? OR key_id = ?;",
  VALIDATE_API_KEY:
    "SELECT k.*, c.name as client_name, c.status as client_status FROM api_keys k " +
    "JOIN api_clients c ON k.client_id = c.client_id " +
    "WHERE k.api_key = ? AND (k.expires_at IS NULL OR k.expires_at > NOW());",
  GET_API_KEY_BY_KEY:
    "SELECT * FROM api_keys WHERE api_key = ? AND is_active = 1;",
  GET_ACTIVE_API_KEY_BY_UUID:
    "SELECT * FROM api_keys WHERE key_uuid = ? AND is_active = 1;",
  GET_CLIENT_BY_API_KEY:
    "SELECT c.* FROM api_clients c JOIN api_keys k ON c.client_id = k.client_id WHERE k.api_key = ? AND k.is_active = 1 AND c.status = 'active' AND (k.expires_at IS NULL OR k.expires_at > NOW());",
  COUNT_ACTIVE_KEYS_BY_ENVIRONMENT:
    "SELECT COUNT(*) AS keyCount FROM api_keys WHERE client_id = ? AND api_key LIKE CONCAT(?, '%') AND is_active = 1;",
  GET_ALL_API_KEYS:
    "SELECT k.*, c.name, c.website FROM api_keys k JOIN api_clients c ON k.client_id =  c.client_id;",
};
