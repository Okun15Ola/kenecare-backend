const Response = require("../../utils/response.utils");
const logger = require("../../middlewares/logger.middleware");
const { getDoctorByUserId } = require("../../services/doctors.services.js");

exports.GetDoctorsController = async (req, res, next) => {
  try {
    const doctors = await getAllDoctors();

    return res.sendStatus(200);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};

exports.GetDoctorByIDController = async (req, res, next) => {
  try {
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
exports.CreateDoctorController = async (req, res, next) => {
  try {
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};

exports.UpdateDoctorByIdController = async (req, res, next) => {
  try {
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
exports.UpdateDoctorStatusController = async (req, res, next) => {
  try {
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};

exports.DeleteDoctorByIdController = async (req, res, next) => {
  try {
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
