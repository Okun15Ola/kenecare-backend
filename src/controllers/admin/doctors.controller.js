const Response = require("../../utils/response.utils");
const logger = require("../../middlewares/logger.middleware");
const {
  getAllDoctors,
  getDoctorsCouncilRegistration,
  getDoctorByUserId,
  approveDoctorProfile,
} = require("../../services/doctors.services.js");
const { getDoctorById } = require("../../db/db.doctors.js");

exports.GetDoctorsController = async (req, res, next) => {
  try {
    const response = await getAllDoctors();
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
exports.GetDoctorsCouncilRegistrationController = async (req, res, next) => {
  try {
    const response = await getAllDoctors();
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};

exports.GetDoctorByIDController = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const response = await getDoctorById(id);
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
exports.ApproveDoctorAccountController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = parseInt(req.user.id);
    const response = await approveDoctorProfile({
      doctorId: id,
      approvedBy: userId,
    });
    return res.status(response.statusCode).json(response);
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
