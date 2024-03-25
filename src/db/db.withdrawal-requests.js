const { connectionPool } = require("./db.connection");

exports.getAllWithdrawalRequests = () => {
  const sql =
    "SELECT request_id, doctors.doctor_id, first_name, last_name, requested_amount,request_status, payment_method, mobile_money_number, bank_name,bank_account_name, bank_account_number, request_status, processed_by, comments, requsets.created_at, requsets.updated_at FROM withdrawal_requests as requsets INNER JOIN doctors on requsets.doctor_id = doctors.doctor_id";
  return new Promise((resolve, reject) => {
    connectionPool.query(sql, (err, result) => {
      if (err) return reject(err);

      return resolve(result);
    });
  });
};
exports.getWithdrawalRequestById = (id) => {
  const sql =
    "SELECT request_id, doctors.doctor_id, first_name, last_name, requested_amount, request_status, payment_method, mobile_money_number, bank_name,bank_account_name, bank_account_number, request_status, processed_by, comments, requsets.created_at, requsets.updated_at FROM withdrawal_requests as requsets INNER JOIN doctors on requsets.doctor_id = doctors.doctor_id WHERE request_id = ?";
  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [id], (err, result) => {
      if (err) return reject(err);

      return resolve(result[0]);
    });
  });
};

exports.approveWithdrawalRequest = ({ adminId, withdrawalId, comment }) => {
  const sql =
    "UPDATE withdrawal_requests SET request_status = 'approved', processed_by = ?, comments = ? WHERE request_id = ?";
  return new Promise((resolve, reject) => {
    connectionPool.query(
      sql,
      [adminId, comment, withdrawalId],
      (err, results) => {
        if (err) return reject(err);

        return resolve(results);
      }
    );
  });
};
exports.denyWithdrawalRequest = ({ adminId, withdrawalId, comment }) => {
  const sql =
    "UPDATE withdrawal_requests SET request_status = 'declined', processed_by = ?, comments = ? WHERE request_id = ?";
  return new Promise((resolve, reject) => {
    connectionPool.query(
      sql,
      [adminId, comment, withdrawalId],
      (err, results) => {
        if (err) return reject(err);

        return resolve(results);
      }
    );
  });
};
