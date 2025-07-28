module.exports = {
  ADD_API_CLIENT:
    "INSERT INTO api_clients(client_uuid, name, description, contact_email, contact_phone, website) VALUES(?, ?, ?, ?, ?, ?);",
  REMOVE_CLIENT:
    "DELETE FROM api_clients WHERE client_uuid = ? OR client_id = ?;",
  GET_CLIENT_BY_UUID: "SELECT * FROM api_clients WHERE client_uuid = ?;",
  GET_CLIENT_BY_ID: "SELECT * FROM api_clients WHERE client_id = ?;",
  GET_CLIENTS: "SELECT * FROM api_clients;",
};
