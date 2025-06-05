const { query } = require("./db.connection");
const queries = require("./queries/doctorWallet.queries");

exports.getWalletByDoctorId = async (doctorId) => {
  const row = await query(queries.GET_BY_DOCTOR_ID, [doctorId]);
  return row[0];
};

exports.getWalletById = async (walletId) => {
  const row = await query(queries.GET_BY_WALLET_ID, [walletId]);
  return row[0];
};

exports.updateWalletPin = async ({ pin, doctorId }) => {
  return query(queries.UPDATE_PIN, [pin, doctorId]);
};

exports.createDoctorWallet = async ({ doctorId, pin }) => {
  return query(queries.CREATE_WALLET, [doctorId, pin]);
};

exports.getCurrentWalletBalance = async (doctorId) => {
  const row = await query(queries.GET_BALANCE, [doctorId]);
  return row[0];
};

exports.updateDoctorWalletBalance = async ({ doctorId, amount }) => {
  return query(queries.UPDATE_BALANCE, [amount, doctorId]);
};

exports.getWithdrawalRequestByDoctorId = async (doctorId) => {
  const row = await query(queries.GET_WITHDRAWAL_REQUEST, [doctorId]);
  return row[0];
};

exports.getWithdrawalRequestByDoctorIdAndDate = async ({ doctorId, date }) => {
  return query(queries.GET_WITHDRAWAL_REQUEST_BY_DATE, [date, doctorId]);
};

exports.createWithDrawalRequest = async ({
  doctorId,
  amount,
  paymentMethod,
  mobileMoneyNumber,
  bankName,
  accountName,
  accountNumber,
}) => {
  return query(queries.CREATE_WITHDRAWAL_REQUEST, [
    doctorId,
    amount,
    paymentMethod,
    mobileMoneyNumber,
    bankName,
    accountName,
    accountNumber,
  ]);
};
