const { connectionPool } = require("./db.connection");

exports.getAllAdmins = () => {
  const sql = "SELECT * FROM admins;";
  return new Promise((resolve, reject) => {
    connectionPool.query(sql, (err, result) => {
      if (err) return reject(err);

      return resolve(result);
    });
  });
};

exports.getAdminById = (adminId) => {
  const sql = "SELECT * FROM admins WHERE admin_id = ? LIMIT 1";
  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [adminId], (err, result) => {
      if (err) return reject(err);

      return resolve(result[0]);
    });
  });
};

exports.getAdminByMobileNumber = (mobileNumber) => {
  const sql = "SELECT * from admins WHERE mobile_number = ? LIMIT 1;";
  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [mobileNumber], (err, result) => {
      if (err) return reject(err);

      return resolve(result[0]);
    });
  });
};
exports.getAdminByEmail = (email) =>
  new Promise((resolve, reject) => {
    const sql = "SELECT * from admins WHERE email = ? LIMIT 1;";
    connectionPool.query(sql, [email], (err, result) => {
      if (err) return reject(err);

      return resolve(result[0]);
    });
  });

exports.createNewAdmin = (admin) => {
  const { fullname, email, mobileNumber, password } = admin;
  const sql = "CALL Sp_InsertAdmin(?,?,?,?)";
  return new Promise((resolve, reject) => {
    connectionPool.query(
      sql,
      [fullname, email, mobileNumber, password],
      (err, result) => {
        if (err) return reject(err);
        return resolve(result);
      },
    );
  });
};

exports.updateAdminEmailById = ({ adminId, email }) => {
  const sql = "UPDATE admins SET  email = ? WHERE admin_id = ?;";
  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [email, adminId], (err, result) => {
      if (err) return reject(err);

      return resolve(result);
    });
  });
};

exports.updateAdminMobileNumberById = ({ adminId, mobileNumber }) => {
  const sql = "UPDATE admins SET  mobile_number = ? WHERE admin_id = ?;";
  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [mobileNumber, adminId], (err, result) => {
      if (err) return reject(err);

      return resolve(result);
    });
  });
};

exports.updateAdminAccountStatusById = ({ id, status }) => {
  const sql = "UPDATE admins SET  is_account_active = ? WHERE admin_id = ?;";
  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [status, id], (err, result) => {
      if (err) return reject(err);

      return resolve(result);
    });
  });
};
exports.updateUserVerificationStatusById = ({ userId, verificationStatus }) => {
  const sql = "UPDATE admins SET  is_verified = ? WHERE user_id = ?;";
  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [verificationStatus, userId], (err, result) => {
      if (err) return reject(err);

      return resolve(result);
    });
  });
};
exports.updateUserPasswordById = ({ userId, password }) => {
  const sql = "UPDATE admins SET  password = ? WHERE user_id = ?;";
  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [password, userId], (err, result) => {
      if (err) return reject(err);

      return resolve(result);
    });
  });
};

exports.deleteUserById = (userId) => {
  const sql = "DELETE FROM admins WHERE user_id = ?";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [userId], (err, result) => {
      if (err) return reject(err);

      return resolve(result);
    });
  });
};

// exports.getUserByUsername = (username) => {
//   return new Promise((resolve, reject) => {
//     const sql = `SELECT * from admins WHERE username = ? LIMIT = 1;`;
//     connectionPool.query(sql, [username], (err, result) => {
//       if (err) return reject(err);

//       return resolve(result[0]);
//     });
//   });
// };
