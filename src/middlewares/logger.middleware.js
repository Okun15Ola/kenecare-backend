const winston = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");
const path = require("path");
const fs = require("fs");

const logDirectory = path.join(__dirname, "../logs");

if (!fs.existsSync(logDirectory)) {
  // Directory doesn't exist, create it
  fs.mkdirSync(logDirectory, { recursive: true });
}

const customFormat = winston.format((info) => {
  if (info.level === "error") {
    return {
      ...info,
      message: `${info.message}`,
      stack: info.stack,
    };
  }
  if (info.level === "info") {
    return {
      ...info,
      message: `${info.message}`,
      stack: info.stack,
    };
  }
  return info;
});
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
  format: winston.format.combine(
    winston.format.timestamp(),
    customFormat(),
    winston.format.json(),
  ),
  transports: [accessLogTransport, errorLogTransport],
});
module.exports = logger;
