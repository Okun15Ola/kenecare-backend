const mysql = require("mysql2");
const session = require("express-session");

const MySQLStore = require("express-mysql-session")(session);
const {
  dbHost,
  dbUsername,
  dbPassword,
  dbName,
  dbPort,
  dbConnectionLimit,
} = require("../config/default.config");

// Improved and more complete DB configuration:
const dbConfig = {
  host: dbHost,
  user: dbUsername,
  password: dbPassword,
  database: dbName,
  port: dbPort,
  connectionLimit: dbConnectionLimit,
  waitForConnections: true, // Queue queries if no connection is available
  queueLimit: 0, // 0 means unlimited queued requests
  connectTimeout: 10000, // 10 seconds before connection times out
  multipleStatements: false, // Prevent SQL injection risks
};

// Create a connection pool with the above config:
const connectionPool = mysql.createPool(dbConfig);

// Create session store using the same config:
const sessionStore = new MySQLStore(dbConfig);

// Promise-based query utility function:
const query = (sql, params) => {
  return new Promise((resolve, reject) => {
    connectionPool.query(sql, params, (error, results) => {
      if (error) {
        return reject(error);
      }
      return resolve(results);
    });
  });
};

// Exporting the utilities:
module.exports = { dbConfig, sessionStore, connectionPool, query };
