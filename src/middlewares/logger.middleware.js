const winston = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");
const path = require("path");
const logDirectory = path.join(__dirname, "../logs");
const fs = require("fs");
// if (!fs.existsSync(logDirectory)) {
//   // Directory doesn't exist, create it
//   fs.mkdirSync(logDirectory, { recursive: true });

// } else {
//   console.log(`Directory '${directoryPath}' already exists.`);
// }

const accessLogTransport = new DailyRotateFile({
  filename: "access-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  dirname: logDirectory,
  maxSize: "20m",
  maxFiles: "30d",
});

const errorLogTransport = new DailyRotateFile({
  filename: "error-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  dirname: logDirectory,
  level: "error",
  maxSize: "20m",
  maxFiles: "30d",
});

const logger = winston.createLogger({
  transports: [accessLogTransport, errorLogTransport],
});
module.exports = logger;
