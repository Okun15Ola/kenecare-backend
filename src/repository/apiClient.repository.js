const { query } = require("./db.connection");
const queries = require("./queries/apiClients.queries");

exports.createApiClient = async (
  clientUuid,
  clientName,
  description,
  email,
  phone,
  website,
) => {
  return query(queries.ADD_API_CLIENT, [
    clientUuid,
    clientName,
    description,
    email,
    phone,
    website,
  ]);
};

exports.deleteApiClient = async (clientUuid) => {
  return query(queries.REMOVE_CLIENT, [clientUuid, null]);
};

exports.getApiClientByUuid = async (clientUuid) => {
  const row = await query(queries.GET_CLIENT_BY_UUID, [clientUuid]);
  return row[0];
};

exports.getApiClientById = async (clientId) => {
  const row = await query(queries.GET_CLIENT_BY_ID, [clientId]);
  return row[0];
};

exports.getApiClients = async () => {
  return query(queries.GET_CLIENTS);
};
