module.exports = {
  GET_BY_DOCTOR_ID: `
    SELECT dw.doctor_id, first_name, last_name, dw.wallet_pin, balance
    FROM doctors_wallet AS dw
    INNER JOIN doctors ON dw.doctor_id = doctors.doctor_id
    WHERE dw.doctor_id = ?;
  `,
  GET_BY_WALLET_ID: `
    SELECT dw.doctor_id, first_name, last_name, balance
    FROM doctors_wallet AS dw
    WHERE wallet_id = ?;
  `,
  UPDATE_PIN: `
    UPDATE doctors_wallet SET wallet_pin = ? WHERE doctor_id = ?;
  `,
  CREATE_WALLET: `
    INSERT INTO doctors_wallet (doctor_id, wallet_pin) VALUES (?,?);
  `,
  GET_BALANCE: `
    SELECT balance FROM doctors_wallet WHERE doctor_id = ? FOR UPDATE;
  `,
  UPDATE_BALANCE: `
    UPDATE doctors_wallet SET balance = ? WHERE doctor_id = ?;
  `,
  GET_WITHDRAWAL_REQUEST: `
    SELECT * FROM withdrawal_requests WHERE doctor_id = ? AND status = 'pending' LIMIT 1;
  `,
  GET_WITHDRAWAL_REQUEST_BY_DATE: `
    SELECT * FROM withdrawal_requests WHERE doctor_id = ? AND DATE_FORMAT(created_at, '%Y-%m-%d') = ?;
  `,
};
