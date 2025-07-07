module.exports = {
  GET_ALL_APPOINTMENT_PAYMENTS: "SELECT * FROM appointment_payments",
  GET_APPOINTMENT_PAYMENT_BY_ID:
    "SELECT * FROM appointment_payments WHERE payment_id = ?;",
  CREATE_APPOINTMENT_PAYMENT: `
    INSERT INTO appointment_payments (appointment_id, amount_paid, payment_method, order_id, payment_token, notification_token, transaction_id)
    VALUES (?, ?, ?, ?, ?, ?, ?);
  `,
  CREATE_FIRST_APPOINTMENT_PAYMENT: `
    INSERT INTO appointment_payments (appointment_id, amount_paid, payment_method, order_id, transaction_id, payment_token, notification_token, payment_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?);
  `,
  UPDATE_APPOINTMENT_PAYMENT_STATUS: `
    UPDATE appointment_payments SET payment_status = ?, transaction_id = ? WHERE payment_id = ?;
  `,
  GET_APPOINTMENT_PAYMENT_BY_APPOINTMENT_ID: `
    SELECT * FROM appointment_payments WHERE appointment_id = ? LIMIT 1;
  `,
  GET_APPOINTMENT_PAYMENT_BY_ORDER_ID: `
    SELECT * FROM appointment_payments WHERE order_id = ? LIMIT 1;
  `,
  GET_APPOINTMENT_PAYMENT_BY_PAYMENT_TOKEN: `
    SELECT * FROM appointment_payments WHERE payment_token = ? LIMIT 1;
  `,
  GET_APPOINTMENT_PAYMENTS_BY_STATUS: `
    SELECT * FROM appointment_payments WHERE payment_status = ? LIMIT 1;
  `,
  DELETE_APPOINTMENT_PAYMENT_BY_APPOINTMENT_ID: `
    DELETE FROM appointment_payments WHERE appointment_id = ? LIMIT 1;
  `,
};
