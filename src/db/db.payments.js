const { connectionPool } = require("./db.connection");

exports.getAllAppointmentPayments = () => {
  const sql = "SELECT * FROM appointment_payments;";
  return new Promise((resolve, reject) => {
    connectionPool.query(sql, (err, result) => {
      if (err) return reject(err);

      return resolve(result);
    });
  });
};

exports.getAppointmentPaymentById = (paymentId) => {
  const sql = "SELECT * FROM users WHERE user_type = ?";
  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [typeId], (err, result) => {
      if (err) return reject(err);

      return resolve(result);
    });
  });
};

exports.createAppointmentPayment = ({
  appointmentId,
  amountPaid,
  paymentMethod,
  orderId,
  paymentToken,
  notificationToken,
}) => {
  const sql =
    "INSERT INTO appointment_payments (appointment_id, amount_paid, payment_method, order_id, payment_token,notification_token) VALUES (?,?,?,?,?,?)";
  return new Promise((resolve, reject) => {
    connectionPool.query(
      sql,
      [
        appointmentId,
        amountPaid,
        paymentMethod,
        orderId,
        paymentToken,
        notificationToken,
      ],
      (error, results) => {
        if (error) return reject(error);

        return resolve(results);
      }
    );
  });
};

exports.updateAppointmentPaymentStatus = ({
  paymentId,
  paymentStatus,
  transactionId,
}) => {
  const sql = `UPDATE appointment_payments SET  payment_status = ?, transaction_id = ? WHERE payment_id = ?;`;
  return new Promise((resolve, reject) => {
    connectionPool.query(
      sql,
      [paymentStatus, transactionId, paymentId],
      (err, result) => {
        if (err) return reject(err);

        return resolve(result);
      }
    );
  });
};

exports.updateAppointmentPaymentByAppointmentId = ({ appointmentId }) => {
  const sql = "SELECT * FROM blogs WHERE blog_id = ? LIMIT 1";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [id], (error, results) => {
      if (error) return reject(error);

      return resolve(results[0]);
    });
  });
};

exports.getAppointmentPaymentByOrderId = (orderId) => {
  const sql = "SELECT * FROM appointment_payments WHERE order_id = ? LIMIT 1;";
  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [orderId], (err, results) => {
      if (err) return reject(err);

      return resolve(results);
    });
  });
};

exports.getAppointmentPaymentByPaymentToken = (paymentToken) => {
  const sql =
    "SELECT * FROM appointment_payments WHERE payment_token = ? LIMIT 1;";
  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [paymentToken], (err, result) => {
      if (err) return reject(err);

      return resolve(result[0]);
    });
  });
};
exports.getAppointmentPaymentByAppointmentId = (appointmentId) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM appointment_payments WHERE appointment_id = ? LIMIT 1;`;
    connectionPool.query(sql, [appointmentId], (err, result) => {
      if (err) return reject(err);

      return resolve(result[0]);
    });
  });
};

exports.getAppointmentPaymentsByStatus = (paymentStatus) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT * from appointment_payments WHERE payment_status = ? LIMIT 1;`;
    connectionPool.query(sql, [paymentStatus], (err, results) => {
      if (err) return reject(err);

      return resolve(results);
    });
  });
};
exports.deleteAppointmentPaymentByAppointmentId = ({ appointmentId }) => {
  return new Promise((resolve, reject) => {
    const sql = `DELETE FROM appointment_payments WHERE appointment_id = ? LIMIT 1;`;
    connectionPool.query(sql, [appointmentId], (err, results) => {
      if (err) return reject(err);

      return resolve(results);
    });
  });
};
