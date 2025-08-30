module.exports = {
  CREATE_WITHDRAWAL_REQUEST: `
    INSERT INTO withdrawal_requests (doctor_id, transaction_id, order_id, amount, currency, payment_type, finance_account_id, mobile_money_provider, mobile_number, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending');
  `,
  GET_ALL_WITHDRAWAL_REQUESTS: `
    SELECT 
      requests.request_id, 
      doctors.doctor_id, 
      doctors.first_name, 
      doctors.last_name, 
      requests.transaction_id,
      requests.order_id,
      requests.amount, 
      requests.currency,
      requests.payment_type, 
      requests.finance_account_id,
      requests.transaction_reference,
      requests.mobile_money_provider,
      requests.mobile_number,  
      requests.status, 
      requests.created_at, 
      requests.updated_at
    FROM withdrawal_requests as requests
    INNER JOIN doctors on requests.doctor_id = doctors.doctor_id
  `,
  COUNT_WITHDRAWAL_REQUEST:
    "SELECT COUNT(*) As totalRows FROM withdrawal_requests;",
  GET_WITHDRAWAL_BY_TRANSACTION_ID: `
    SELECT 
      requests.request_id, 
      doctors.doctor_id, 
      doctors.first_name, 
      doctors.last_name, 
      requests.transaction_id,
      requests.order_id,
      requests.amount, 
      requests.currency,
      requests.payment_type, 
      requests.finance_account_id,
      requests.transaction_reference,
      requests.mobile_money_provider,
      requests.mobile_number,  
      requests.status, 
      requests.created_at, 
      requests.updated_at
    FROM withdrawal_requests as requests
    INNER JOIN doctors on requests.doctor_id = doctors.doctor_id
    WHERE requests.transaction_id = ?;
  `,
  GET_WITHDRAWAL_REQUEST_BY_DOCTOR_ID: `
    SELECT 
      requests.request_id, 
      doctors.doctor_id, 
      doctors.first_name, 
      doctors.last_name, 
      requests.transaction_id,
      requests.order_id,
      requests.amount, 
      requests.currency,
      requests.payment_type, 
      requests.finance_account_id,
      requests.transaction_reference,
      requests.mobile_money_provider,
      requests.mobile_number,  
      requests.status, 
      requests.created_at, 
      requests.updated_at
    FROM withdrawal_requests as requests
    INNER JOIN doctors on requests.doctor_id = doctors.doctor_id
    WHERE requests.doctor_id = ?;
  `,
  UPDATE_WITHDRAWAL_REQUEST: `
    UPDATE withdrawal_requests 
    SET status = ?, transaction_reference = ?
    WHERE request_id = ?;
  `,
};
