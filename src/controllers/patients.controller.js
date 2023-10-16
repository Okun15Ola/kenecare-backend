const bcryptjs = require("bcryptjs");
const Response = require("../utils/response.utils");
const logger = require("../middlewares/logger.middleware");

exports.GetPatientProfileController = async (req, res, next) => {
  try {
    const { otp } = req.params;
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};

exports.CreatePatientProfileController = async (req, res, next) => {
  try {
    const { otp } = req.params;
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
exports.CreatePatientMedicalHistoryController = async (req, res, next) => {
  try {
    const { otp } = req.params;
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};

exports.CreatePatientMedicalDocumentController = async (req, res, next) => {
  try {
    const { otp } = req.params;
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
exports.CreatePatientTestimonialController = async (req, res, next) => {
  try {
    const { otp } = req.params;
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
