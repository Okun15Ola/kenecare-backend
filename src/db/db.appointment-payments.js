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

exports.getAppointmentPaymentByOrderId = (orderId) => {
  const sql =
    "SELECT user_id mobile_number,email,user_type,is_verified,is_account_active,is_online,is_2fa_enabled FROM users WHERE user_id = ? LIMIT  1";
  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [userId], (err, result) => {
      if (err) return reject(err);

      return resolve(result[0]);
    });
  });
};

exports.getAppointmentPaymentByPaymentToken = (paymentToken) => {
  const sql = "SELECT * from users WHERE mobile_number = ? LIMIT 1;";
  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [mobileNumber], (err, result) => {
      if (err) return reject(err);

      return resolve(result[0]);
    });
  });
};
exports.getAppointmentPaymentByAppointmentId = (email) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT * from users WHERE email = ? LIMIT 1;`;
    connectionPool.query(sql, [email], (err, result) => {
      if (err) return reject(err);

      return resolve(result[0]);
    });
  });
};

exports.getAppointmentPaymentsByStatus = (paymentStatus) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT * from users WHERE verification_token = ? LIMIT 1;`;
    connectionPool.query(sql, [token], (err, result) => {
      if (err) return reject(err);

      return resolve(result[0]);
    });
  });
};

exports.createNewAppointmentPayment = ({
  orderId,
  amount,
  paymentToken,
  appointmentId,
  paymentMethod = "ORANGE MONEY",
  notificationToken,
}) => {
  const email = user.email || null;
  const { mobileNumber, userType, vToken, password } = user;
  const sql =
    "INSERT INTO appointment_payments (mobile_number, email,user_type, password,verification_token) values (?,?,?,?,?)";
  return new Promise((resolve, reject) => {
    connectionPool.query(
      sql,
      [mobileNumber, email, userType, password, vToken],
      (err, result) => {
        if (err) return reject(err);
        return resolve(result);
      }
    );
  });
};

exports.updateAppointmentPaymentStatus = ({ paymentId, status }) => {
  const sql = `UPDATE appointment_payments SET  payment_status = ? WHERE payment_id = ?;`;
  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [status, paymentId], (err, result) => {
      if (err) return reject(err);

      return resolve(result);
    });
  });
};
exports.updateUserVerificationTokenById = ({ userId, token }) => {
  const sql = `UPDATE users SET  verification_token = ? WHERE user_id = ?;`;
  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [token, userId], (err, result) => {
      if (err) return reject(err);

      return resolve(result);
    });
  });
};

exports.updateUserMobileNumberById = ({ userId, mobileNumber }) => {
  const sql = `UPDATE users SET  mobile_number = ? WHERE user_id = ?;`;
  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [mobileNumber, userId], (err, result) => {
      if (err) return reject(err);

      return resolve(result);
    });
  });
};

exports.updateUserAccountStatusById = ({ userId, status }) => {
  const sql = `UPDATE users SET  is_account_active = ? WHERE user_id = ?;`;
  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [status, userId], (err, result) => {
      if (err) return reject(err);

      return resolve(result);
    });
  });
};
exports.updateUserVerificationStatusById = ({ token, verificationStatus }) => {
  const timestamp = new Date();
  const sql = `UPDATE users SET  is_verified = ?, verification_token = NULL, is_online = 1, verified_at = ? WHERE verification_token = ?;`;
  return new Promise((resolve, reject) => {
    connectionPool.query(
      sql,
      [verificationStatus, timestamp, token],
      (err, result) => {
        if (err) return reject(err);

        return resolve(result);
      }
    );
  });
};
exports.updateUserPasswordById = ({ userId, password }) => {
  const sql = `UPDATE users SET  password = ? WHERE user_id = ?;`;
  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [password, userId], (err, result) => {
      if (err) return reject(err);

      return resolve(result);
    });
  });
};
exports.updateUserOnlineStatus = ({ userId, status }) => {
  const sql = `UPDATE users SET  is_online = ? WHERE user_id = ?;`;
  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [status, userId], (err, result) => {
      if (err) return reject(err);

      return resolve(result);
    });
  });
};

exports.deleteUserById = (userId) => {
  const sql = "DELETE FROM users WHERE user_id = ?";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [userId], (err, result) => {
      if (err) return reject(err);

      return resolve(result);
    });
  });
};
