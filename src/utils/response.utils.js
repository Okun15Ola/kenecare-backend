const HttpStatus = require("http-status-codes");

const Response = {};
Response.SUCCESS = ({ message, data, pagination }) => {
  const timestamp = new Date();
  return {
    status: "success",
    statusCode: HttpStatus.StatusCodes.OK,
    timestamp,
    message,
    data,
    ...(pagination && { pagination }), // only include if pagination exists
  };
};
Response.NOT_MODIFIED = () => {
  const timestamp = new Date();
  return {
    status: "not modified",
    statusCode: HttpStatus.StatusCodes.NOT_MODIFIED,
    timestamp,
    message: null,
    data: null,
  };
};
Response.NO_CONTENT = () => {
  const timestamp = new Date();
  return {
    status: "no content",
    statusCode: HttpStatus.StatusCodes.NO_CONTENT,
    timestamp,
    message: null,
    data: null,
  };
};
Response.CREATED = ({ data, message }) => {
  const timestamp = new Date();
  return {
    status: "created",
    statusCode: HttpStatus.StatusCodes.CREATED,
    timestamp,
    message,
    data,
  };
};

Response.BAD_REQUEST = ({ message, error, errorCode }) => {
  const timestamp = new Date();
  return {
    status: "error",
    errorCode,
    statusCode: HttpStatus.StatusCodes.BAD_REQUEST,
    timestamp,
    message,
    errors: error,
  };
};

Response.UNAUTHORIZED = ({ message, error, errorCode }) => {
  const timestamp = new Date();
  return {
    status: "error",
    errorCode,
    statusCode: HttpStatus.StatusCodes.UNAUTHORIZED,
    timestamp,
    message: message || "Authentication required",
    errors: error,
  };
};
Response.NOT_FOUND = ({ message, error, errorCode }) => {
  const timestamp = new Date();
  return {
    status: "error",
    errorCode,
    statusCode: HttpStatus.StatusCodes.NOT_FOUND,
    timestamp,
    message,
    errors: error,
  };
};

Response.FORBIDDEN = ({ message, error, errorCode }) => {
  const timestamp = new Date();
  return {
    status: "error",
    errorCode,
    statusCode: HttpStatus.StatusCodes.FORBIDDEN,
    timestamp,
    message: message || "You don't have permission to access this resource",
    errors: error,
  };
};

Response.INTERNAL_SERVER_ERROR = ({ message, errorCode }) => {
  const timestamp = new Date();
  return {
    status: "error",
    errorCode,
    statusCode: HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR,
    timestamp,
    message: message || "Internal server error",
    errors: null,
  };
};

Response.CONFLICT = ({ message, error, errorCode }) => {
  const timestamp = new Date();
  return {
    status: "error",
    errorCode,
    statusCode: HttpStatus.StatusCodes.CONFLICT,
    timestamp,
    message: message || "Resource conflict",
    errors: error,
  };
};

Response.TOO_MANY_REQUESTS = ({ message, error, errorCode, retryAfter }) => {
  const timestamp = new Date();
  return {
    status: "error",
    errorCode,
    statusCode: HttpStatus.StatusCodes.TOO_MANY_REQUESTS,
    timestamp,
    message: message || "Too many requests",
    errors: error,
    ...(retryAfter && { retryAfter }),
  };
};

Response.BAD_GATEWAY = ({ message, errorCode }) => {
  const timestamp = new Date();
  return {
    status: "error",
    errorCode,
    statusCode: HttpStatus.StatusCodes.BAD_GATEWAY,
    timestamp,
    message: message || "Bad gateway",
    errors: null,
  };
};

Response.SERVICE_UNAVAILABLE = ({ message, errorCode, retryAfter }) => {
  const timestamp = new Date();
  return {
    status: "error",
    errorCode,
    statusCode: HttpStatus.StatusCodes.SERVICE_UNAVAILABLE,
    timestamp,
    message: message || "Service temporarily unavailable",
    errors: null,
    ...(retryAfter && { retryAfter }),
  };
};

module.exports = Response;
