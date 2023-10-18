const mysql = require("mysql2");
const {
  dbHost,
  dbUsername,
  dbPassword,
  dbName,
  dbPort,
  dbConnectionLimit,
} = require("../config/default.config");
const session = require("express-session");

const MySQLStore = require("express-mysql-session")(session);

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

module.exports = { dbConfig, sessionStore, connectionPool };
