// const { connectionPool } = require("./db.connection");

// exports.getAllAppointmentPayments = () => {
//   const sql = "SELECT * FROM appointment_payments;";
//   return new Promise((resolve, reject) => {
//     connectionPool.query(sql, (err, result) => {
//       if (err) return reject(err);

//       return resolve(result);
//     });
//   });
// };

// exports.getAppointmentPaymentById = (paymentId) => {
//   const sql = "SELECT * FROM users WHERE user_type = ?";
//   return new Promise((resolve, reject) => {
//     connectionPool.query(sql, [typeId], (err, result) => {
//       if (err) return reject(err);

//       return resolve(result);
//     });
//   });
// };

// exports.getAppointmentPaymentByOrderId = (orderId) => {
//   const sql =
//     "SELECT user_id mobile_number,email,user_type,is_verified,is_account_active,is_online,is_2fa_enabled FROM users WHERE user_id = ? LIMIT  1";
//   return new Promise((resolve, reject) => {
//     connectionPool.query(sql, [userId], (err, result) => {
//       if (err) return reject(err);

//       return resolve(result[0]);
//     });
//   });
// };

// exports.getAppointmentPaymentByPaymentToken = (paymentToken) => {
//   const sql = "SELECT * from users WHERE mobile_number = ? LIMIT 1;";
//   return new Promise((resolve, reject) => {
//     connectionPool.query(sql, [mobileNumber], (err, result) => {
//       if (err) return reject(err);

//       return resolve(result[0]);
//     });
//   });
// };
// exports.getAppointmentPaymentByAppointmentId = (email) => {
//   return new Promise((resolve, reject) => {
//     const sql = `SELECT * from users WHERE email = ? LIMIT 1;`;
//     connectionPool.query(sql, [email], (err, result) => {
//       if (err) return reject(err);

//       return resolve(result[0]);
//     });
//   });
// };

// exports.getAppointmentPaymentsByStatus = (paymentStatus) => {
//   return new Promise((resolve, reject) => {
//     const sql = `SELECT * from users WHERE verification_token = ? LIMIT 1;`;
//     connectionPool.query(sql, [token], (err, result) => {
//       if (err) return reject(err);

//       return resolve(result[0]);
//     });
//   });
// };

// exports.createNewAppointmentPayment = ({
//   appointmentId,
//   orderId,
//   amount,
//   paymentToken,
//   paymentMethod = "ORANGE MONEY",
//   notificationToken,
// }) => {
//   const email = user.email || null;
//   const { mobileNumber, userType, vToken, password } = user;
//   const sql =
//     "INSERT INTO appointment_payments (mobile_number, email,user_type, password,verification_token) values (?,?,?,?,?)";
//   return new Promise((resolve, reject) => {
//     connectionPool.query(
//       sql,
//       [mobileNumber, email, userType, password, vToken],
//       (err, result) => {
//         if (err) return reject(err);
//         return resolve(result);
//       }
//     );
//   });
// };

// exports.updateAppointmentPaymentStatus = ({
//   paymentId,
//   paymentStatus,
//   transactionId,
// }) => {
//   console.log("This is the payment ID: " + paymentId);
//   const sql = `UPDATE appointment_payments SET payment_status = ?, transaction_id = ? WHERE payment_id = ?;`;
//   return new Promise((resolve, reject) => {
//     connectionPool.query(
//       sql,
//       [paymentStatus, transactionId, paymentId],
//       (err, result) => {
//         if (err) return reject(err);

//         return resolve(result);
//       }
//     );
//   });
// };
