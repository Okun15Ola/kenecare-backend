module.exports = {
  GET_ALL_WITHDRAWAL_REQUESTS: `
    SELECT request_id, doctors.doctor_id, first_name, last_name, requested_amount, request_status, payment_method, mobile_money_number, bank_name, bank_account_name, bank_account_number, request_status, processed_by, comments, requests.created_at, requests.updated_at
    FROM withdrawal_requests as requests
    INNER JOIN doctors on requests.doctor_id = doctors.doctor_id
  `,
  COUNT_WITHDRAWAL_REQUEST:
    "SELECT COUNT(*) As totalRows FROM withdrawal_requests;",
  GET_WITHDRAWAL_REQUEST_BY_ID: `
    SELECT request_id, doctors.doctor_id, first_name, last_name, requested_amount, request_status, payment_method, mobile_money_number, bank_name, bank_account_name, bank_account_number, request_status, processed_by, comments, requests.created_at, requests.updated_at
    FROM withdrawal_requests as requests
    INNER JOIN doctors on requests.doctor_id = doctors.doctor_id
    WHERE request_id = ?;
  `,
  APPROVE_WITHDRAWAL_REQUEST: `
    UPDATE withdrawal_requests SET request_status = 'approved', processed_by = ?, comments = ? WHERE request_id = ?;
  `,
  DENY_WITHDRAWAL_REQUEST: `
    UPDATE withdrawal_requests SET request_status = 'declined', processed_by = ?, comments = ? WHERE request_id = ?;
  `,
};
