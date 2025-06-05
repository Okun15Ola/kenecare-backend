const { query } = require("./db.connection");
const queries = require("./queries/withdrawalRequest.queries");

exports.getAllWithdrawalRequests = async () => {
  return query(queries.GET_ALL_WITHDRAWAL_REQUESTS);
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
