const { query } = require("./db.connection");
const queries = require("./queries/withdrawalRequest.queries");

exports.getAllWithdrawalRequests = async (limit, offset) => {
  const optimizedQuery = `${queries.GET_ALL_WITHDRAWAL_REQUESTS} LIMIT ${limit} OFFSET ${offset}`;
  return query(optimizedQuery);
};

exports.getWithdrawalRequestById = async (id) => {
  const result = await query(queries.GET_WITHDRAWAL_REQUEST_BY_ID, [id]);
  return result[0];
};

exports.approveWithdrawalRequest = async ({
  adminId,
  withdrawalId,
  comment,
}) => {
  return query(queries.APPROVE_WITHDRAWAL_REQUEST, [
    adminId,
    comment,
    withdrawalId,
  ]);
};

exports.denyWithdrawalRequest = async ({ adminId, withdrawalId, comment }) => {
  return query(queries.DENY_WITHDRAWAL_REQUEST, [
    adminId,
    comment,
    withdrawalId,
  ]);
};
