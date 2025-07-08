module.exports = {
  GET_ALL_WITHDRAWAL_REQUESTS: `
    SELECT request_id, doctors.doctor_id, first_name, last_name, requested_amount, request_status, payment_method, mobile_money_number, bank_name, bank_account_name, bank_account_number, request_status, processed_by, comments, requsets.created_at, requsets.updated_at
    FROM withdrawal_requests as requsets
    INNER JOIN doctors on requsets.doctor_id = doctors.doctor_id
  `,
  GET_WITHDRAWAL_REQUEST_BY_ID: `
    SELECT request_id, doctors.doctor_id, first_name, last_name, requested_amount, request_status, payment_method, mobile_money_number, bank_name, bank_account_name, bank_account_number, request_status, processed_by, comments, requsets.created_at, requsets.updated_at
    FROM withdrawal_requests as requsets
    INNER JOIN doctors on requsets.doctor_id = doctors.doctor_id
    WHERE request_id = ?;
  `,
  APPROVE_WITHDRAWAL_REQUEST: `
    UPDATE withdrawal_requests SET request_status = 'approved', processed_by = ?, comments = ? WHERE request_id = ?;
  `,
  DENY_WITHDRAWAL_REQUEST: `
    UPDATE withdrawal_requests SET request_status = 'declined', processed_by = ?, comments = ? WHERE request_id = ?;
  `,
};
