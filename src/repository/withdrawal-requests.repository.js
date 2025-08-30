const { query } = require("./db.connection");
const queries = require("./queries/withdrawalRequest.queries");

exports.createWithdrawalRequest = async ({
  doctorId,
  transactionId,
  orderId,
  amount,
  currency,
  paymentType,
  financialAccountId,
  mobileMoneyProvider,
  mobileNumber,
}) => {
  return query(queries.CREATE_WITHDRAWAL_REQUEST, [
    doctorId,
    transactionId,
    orderId,
    amount,
    currency,
    paymentType,
    financialAccountId,
    mobileMoneyProvider,
    mobileNumber,
  ]);
};

exports.getAllWithdrawalRequests = async (limit, offset) => {
  const optimizedQuery = `${queries.GET_ALL_WITHDRAWAL_REQUESTS} LIMIT ${limit} OFFSET ${offset}`;
  return query(optimizedQuery);
};

exports.countWithdrawalRequests = async () => {
  const result = await query(queries.COUNT_WITHDRAWAL_REQUEST);
  return result[0];
};

exports.getWithdrawalRequestByTransactionId = async (id) => {
  const result = await query(queries.GET_WITHDRAWAL_BY_TRANSACTION_ID, [id]);
  return result[0];
};

exports.updateWithdrawalRequest = async ({
  transactionId,
  status,
  transactionReference,
}) => {
  return query(queries.UPDATE_WITHDRAWAL_REQUEST, [
    status,
    transactionReference,
    transactionId,
  ]);
};
