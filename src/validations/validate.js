const { validationResult } = require("express-validator");
const { BAD_REQUEST } = require("../utils/response.utils");

const Validate = (req, res, next) => {
  let errors = validationResult(req).array();

  if (errors.length) {
    errors = errors.map((error) => {
      return {
        msg: error.msg,
      };
    });

    return res.status(400).json(BAD_REQUEST("Validation Error", errors));
  }
  next();
};

module.exports = {
  Validate,
};
