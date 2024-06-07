const { connectionPool } = require("./db.connection");

exports.getWalletByDoctorId = (doctorId) => {
  const sql =
    "select dw.doctor_id, first_name, last_name, dw.wallet_pin, balance from doctors_wallet as dw INNER JOIN doctors on dw.doctor_id = doctors.doctor_id where dw.doctor_id = ?;";
  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [doctorId], (err, result) => {
      if (err) return reject(err);

      return resolve(result[0]);
    });
  });
};
exports.getWalletById = (walletId) => {
  const sql =
    "select dw.doctor_id, first_name, last_name, balance from doctors_wallet as dw where  wallet_id = ?;";
  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [walletId], (err, result) => {
      if (err) return reject(err);

      return resolve(result);
    });
  });
};
exports.updateWalletPin = ({ pin, doctorId }) => {
  const sql = "UPDATE doctors_wallet SET wallet_pin = ? WHERE doctor_id = ?;";
  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [pin, doctorId], (err, result) => {
      if (err) return reject(err);

      return resolve(result);
    });
  });
};

exports.createDoctorWallet = ({ doctorId, pin }) => {
  const sql =
    "INSERT INTO doctors_wallet (doctor_id, wallet_pin) VALUES (?,?);";
  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [doctorId, pin], (err, result) => {
      if (err) return reject(err);
      return resolve(result);
    });
  });
};

exports.getCurrentWalletBalance = (doctorId) => {
  const sql =
    "SELECT balance FROM doctors_wallet WHERE doctor_id = ? FOR UPDATE;";
  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [doctorId], (err, result) => {
      if (err) return reject(err);

      return resolve(result[0]);
    });
  });
};
exports.updateDoctorWalletBalance = ({ doctorId, amount }) => {
  const sql = "UPDATE doctors_wallet SET balance = ? WHERE doctor_id = ?;";
  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [amount, doctorId], (err, result) => {
      if (err) return reject(err);

      return resolve(result);
    });
  });
};

exports.getWithdrawalRequestByDoctorId = (doctorId) => {
  const sql =
    "SELECT * FROM withdrawal_requests WHERE doctor_id = ? AND request_status = 'pending' LIMIT 1;";
  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [doctorId], (err, result) => {
      if (err) return reject(err);
      return resolve(result[0]);
    });
  });
};
exports.getWithdrawalRequestByDoctorIdAndDate = ({ doctorId, date }) => {
  const sql =
    "SELECT * FROM withdrawal_requests WHERE doctor_id = ? AND DATE_FORMAT(created_at, '%Y-%m-%d') = ?;";
  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [doctorId, date], (err, result) => {
      if (err) return reject(err);
      return resolve(result);
    });
  });
};

exports.createWithDrawalRequest = ({
  doctorId,
  amount,
  paymentMethod,
  mobileMoneyNumber,
  bankName,
  accountName,
  accountNumber,
}) => {
  const sql =
    "INSERT INTO withdrawal_requests (doctor_id,requested_amount, payment_method, mobile_money_number, bank_name, bank_account_name, bank_account_number) VALUES (?,?,?,?,?,?,?);";
  return new Promise((resolve, reject) => {
    connectionPool.query(
      sql,
      [
        doctorId,
        amount,
        paymentMethod,
        mobileMoneyNumber,
        bankName,
        accountName,
        accountNumber,
      ],
      (err, result) => {
        if (err) return reject(err);
        return resolve(result);
      },
    );
  });
};
