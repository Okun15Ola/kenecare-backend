"use strict";
const HttpStatus = require("http-status-codes");

const Response = {};
Response.SUCCESS = ({ message, data }) => {
  const timestamp = new Date();
  return {
    status: "success",
    statusCode: HttpStatus.StatusCodes.OK,
    timestamp: timestamp,
    message: message,
    data: data,
  };
};
Response.NOT_MODIFIED = () => {
  const timestamp = new Date();
  return {
    status: "no content",
    statusCode: HttpStatus.StatusCodes.NOT_MODIFIED,
    timestamp: timestamp,
    message: null,
    data: null,
  };
};
Response.CREATED = ({ data, message }) => {
  const timestamp = new Date();
  return {
    status: "created",
    statusCode: HttpStatus.StatusCodes.CREATED,
    timestamp: timestamp,
    message: message,
    data: data,
  };
};

Response.BAD_REQUEST = ({ message, error, errorCode }) => {
  const timestamp = new Date();
  return {
    status: "error",
    errorCode,
    statusCode: HttpStatus.StatusCodes.BAD_REQUEST,
    timestamp: timestamp,
    message: message,
    errors: error,
  };
};

Response.UNAUTHORIZED = ({ message, error, errorCode }) => {
  const timestamp = new Date();
  return {
    status: "error",
    errorCode,
    statusCode: HttpStatus.StatusCodes.UNAUTHORIZED,
    timestamp: timestamp,
    message: message,
    errors: error,
  };
};
Response.NOT_FOUND = ({ message, error, errorCode }) => {
  const timestamp = new Date();
  return {
    status: "error",
    errorCode,
    statusCode: HttpStatus.StatusCodes.NOT_FOUND,
    timestamp: timestamp,
    message: message,
    errors: error,
  };
};

Response.INTERNAL_SERVER_ERROR = ({ message, error, errorCode }) => {
  const timestamp = new Date();
  return {
    status: "error",
    errorCode,
    statusCode: HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR,
    timestamp: timestamp,
    message: message,
    errors: null,
  };
};

module.exports = Response;
