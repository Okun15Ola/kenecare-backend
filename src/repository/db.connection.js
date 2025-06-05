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

const dbConfig = {
  host: dbHost,
  user: dbUsername,
  password: dbPassword,
  database: dbName,
  port: dbPort,
  connectionLimit: dbConnectionLimit,
};

const connectionPool = mysql.createPool(dbConfig);

const sessionStore = new MySQLStore(dbConfig);

const query = (sql, params) => {
  try {
    return new Promise((resolve, reject) => {
      connectionPool.query(sql, params, (error, results) => {
        if (error) reject(error);
        resolve(results);
      });
    });
  } catch (error) {
    throw new Error(error.code);
  }
};

module.exports = { dbConfig, sessionStore, connectionPool, query };
