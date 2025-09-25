const { validationResult } = require("express-validator");
const { BAD_REQUEST } = require("../utils/response.utils");
const { deleteFile } = require("../utils/file-upload.utils");
const logger = require("../middlewares/logger.middleware");
const { nodeEnv } = require("../config/default.config");

const Validate = (req, res, next) => {
  const errors = validationResult(req).array({ onlyFirstError: true });

  if (errors.length) {
    if (req.file) {
      deleteFile(req.file?.path);
    }
    // Prepare errors for internal logging (includes field)
    const errorsForLog = errors.map((error) => ({
      field: error.path,
      msg: error.msg,
    }));

    // Prepare errors for client response (only message)
    // errors = errors.map((error) => ({
    //   msg: error.msg,
    // }));
    // The errors array now only contains the first error for each field
    const firstErrorMessage = errors[0].msg;
    logger.error("Validation Error: ", errorsForLog);

    if (nodeEnv === "development") {
      console.error("Validation Error: ", { errorsForLog });
    }
    return res.status(400).json(
      BAD_REQUEST({
        message: firstErrorMessage,
        error: firstErrorMessage,
        errorCode: "ERROR_400",
      }),
    );
  }
  return next();
};

module.exports = {
  Validate,
};
