const { connectionPool } = require("./db.connection");

exports.getAllUsers = () => {
  const sql = "SELECT * FROM users ORDER BY user_id DESC;";
  return new Promise((resolve, reject) => {
    connectionPool.query(sql, (err, result) => {
      if (err) return reject(err);

      return resolve(result);
    });
  });
};

exports.getUserByUsersType = (typeId) => {
  const sql = "SELECT * FROM users WHERE user_type = ?";
  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [typeId], (err, result) => {
      if (err) return reject(err);

      return resolve(result);
    });
  });
};

exports.getUserById = (userId) => {
  const sql =
    "SELECT user_id mobile_number,email,user_type,is_verified,is_account_active,is_online,is_2fa_enabled FROM users WHERE user_id = ? LIMIT = 1";
  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [userId], (err, result) => {
      if (err) return reject(err);

      return resolve(result[0]);
    });
  });
};

exports.getUserByMobileNumber = (mobileNumber) => {
  const sql = "SELECT * from users WHERE mobile_number = ? LIMIT = 1;";
  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [mobileNumber], (err, result) => {
      if (err) return reject(err);

      return resolve(result[0]);
    });
  });
};
exports.getUserByEmail = (email) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT * from users WHERE email = ? LIMIT = 1;`;
    connectionPool.query(sql, [email], (err, result) => {
      if (err) return reject(err);

      return resolve(result[0]);
    });
  });
};
exports.getUserByVerificationToken = (token) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT * from users WHERE verification_token = ? LIMIT = 1;`;
    connectionPool.query(sql, [token], (err, result) => {
      if (err) return reject(err);

      return resolve(result[0]);
    });
  });
};

exports.createNewUser = (user) => {
  const email = user.email || null;
  const { mobileNumber, userType, verificationToken, password } = user;
  const sql =
    "INSERT INTO users (mobile_number, email,user_type, password,verification_token) values (?,?)";
  return new Promise((resolve, reject) => {
    connectionPool.query(
      sql,
      [mobileNumber, email, userType, password, verificationToken],
      (err, result) => {
        if (err) return reject(err);
        console.log(result);
        return resolve(result);
      }
    );
  });
};

exports.updateUserEmailById = ({ userId, email }) => {
  const sql = `UPDATE users SET  email = ? WHERE user_id = ?;`;
  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [email, userId], (err, result) => {
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

exports.updateUserAccountStatusById = ({ userId, accountStatus }) => {
  const sql = `UPDATE users SET  is_account_active = ? WHERE user_id = ?;`;
  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [accountStatus, userId], (err, result) => {
      if (err) return reject(err);

      return resolve(result);
    });
  });
};
exports.updateUserVerificationStatusById = ({ userId, verificationStatus }) => {
  const sql = `UPDATE users SET  is_verified = ? WHERE user_id = ?;`;
  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [verificationStatus, userId], (err, result) => {
      if (err) return reject(err);

      return resolve(result);
    });
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

exports.deleteUserById = (userId) => {
  const sql = "DELETE FROM users WHERE user_id = ?";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [userId], (err, result) => {
      if (err) return reject(err);

      return resolve(result);
    });
  });
};

// exports.getUserByUsername = (username) => {
//   return new Promise((resolve, reject) => {
//     const sql = `SELECT * from users WHERE username = ? LIMIT = 1;`;
//     connectionPool.query(sql, [username], (err, result) => {
//       if (err) return reject(err);

//       return resolve(result[0]);
//     });
//   });
// };
