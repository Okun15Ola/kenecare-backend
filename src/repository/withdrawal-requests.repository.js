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
  status,
  failureDetails = null,
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
    status,
    failureDetails,
  ]);
};

exports.getAllWithdrawalRequests = async (limit, offset) => {
  return query(queries.GET_ALL_WITHDRAWAL_REQUESTS, [offset, limit]);
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

exports.getDoctorWithdrawalHistory = async (doctorId, limit, offset) => {
  return query(queries.GET_DOCTOR_WITHDRAWAL_HISTORY, [
    doctorId,
    offset,
    limit,
  ]);
};

exports.countDoctorWithdrawalHistory = async (doctorId) => {
  const row = await query(queries.COUNT_DOCTOR_WITHDRAWAL_HISTORY, [doctorId]);
  return row[0];
};
