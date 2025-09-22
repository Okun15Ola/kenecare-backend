/* eslint-disable no-unused-vars */
// src/middlewares/errorHandler.js
const logger = require("./logger.middleware");
const Response = require("../utils/response.utils");

const errorHandler = (err, req, res, next) => {
  logger.error("An unexpected error occurred:", err);

  // Default error response
  let statusCode = err.statusCode || 500;
  let message = err.message || "An unexpected error occurred.";

  // Handle specific custom error codes
  if (err.code === "FILE_TOO_LARGE") {
    statusCode = 400;
    message = "Selected file is too large. Max file size: 10MB";
  } else if (err.code === "INVALID_FILE_TYPE") {
    statusCode = 400;
  }

  // Handle specific external API response errors
  if (err.response) {
    statusCode = err.response.status || 500;
    message = err.response.statusText || "External service error";
  }

  // Send the final standardized error response
  switch (statusCode) {
    case 400:
      return res.status(statusCode).json(Response.BAD_REQUEST({ message }));
    case 401:
      return res.status(statusCode).json(Response.UNAUTHORIZED({ message }));
    case 403:
      return res.status(statusCode).json(Response.FORBIDDEN({ message }));
    case 404:
      return res.status(statusCode).json(Response.NOT_FOUND({ message }));
    case 409:
      return res.status(statusCode).json(Response.CONFLICT({ message }));
    case 429:
      return res
        .status(statusCode)
        .json(Response.TOO_MANY_REQUESTS({ message }));
    default:
      return res.status(500).json(Response.INTERNAL_SERVER_ERROR({ message }));
  }
};

module.exports = errorHandler;
