const { validationResult } = require("express-validator");
const { BAD_REQUEST } = require("../utils/response.utils");
const { deleteFile } = require("../utils/file-upload.utils");
const logger = require("../middlewares/logger.middleware");
const { nodeEnv } = require("../config/default.config");

const Validate = (req, res, next) => {
  let errors = validationResult(req).array();

  if (errors.length) {
    if (req.file) {
      deleteFile(req.file?.path);
    }
    errors = errors.map((error) => ({
      field: error.path,
      msg: error.msg,
    }));
    logger.error("Validation Error: ", errors);

    if (nodeEnv === "development") {
      console.error("Validation Error: ", { errors });
    }
    return res
      .status(400)
      .json(BAD_REQUEST({ message: "Validation Error", error: errors }));
  }
  return next();
};

module.exports = {
  Validate,
};
