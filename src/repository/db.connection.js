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
  dbUrl,
  nodeEnv,
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
// const connectionPool = mysql.createPool(dbConfig);
const connectionPool = mysql.createPool({
  uri: dbUrl, // mysql://user:password@host:3306/dbname
  ssl: nodeEnv === "production" ? { rejectUnauthorized: true } : false,
});

// Get the promise-based version of the pool
const promisePool = connectionPool.promise();

// Create session store using the same config:
// const sessionStore = new MySQLStore(dbConfig);
const sessionStore = new MySQLStore({
  uri: dbUrl, // mysql://user:password@host:3306/dbname
  ssl: nodeEnv === "production" ? { rejectUnauthorized: true } : false,
});

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

/**
 * Executes a series of queries in a transaction
 * @param {Function} callback - Async function that takes a connection and executes queries
 * @returns {Promise<any>} Result of the callback function
 */
const withTransaction = async (callback) => {
  const connection = await promisePool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Exporting the utilities:
module.exports = {
  dbConfig: {
    uri: dbUrl,
    ssl: nodeEnv === "production" ? { rejectUnauthorized: true } : false,
  },
  sessionStore,
  connectionPool,
  query,
  withTransaction,
  promisePool,
};
