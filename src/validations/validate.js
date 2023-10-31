const { validationResult } = require("express-validator");
const { BAD_REQUEST } = require("../utils/response.utils");
const fs = require("fs");

const Validate = (req, res, next) => {
  let errors = validationResult(req).array();

  if (errors.length) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    errors = errors.map((error) => {
      return {
        msg: error.msg,
      };
    });

    return res
      .status(400)
      .json(BAD_REQUEST({ message: "Validation Error", error: errors }));
  }
  next();
};

module.exports = {
  Validate,
};
