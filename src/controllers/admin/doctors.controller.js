const Response = require("../../utils/response.utils");
const logger = require("../../middlewares/logger.middleware");
const {
  getAllDoctors,
  getDoctorById,
  getDoctorsCouncilRegistration,
  getDoctorByUserId,
  approveDoctorProfile,
} = require("../../services/doctors.services.js");

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
    const { id: doctorId } = req.params;
    const response = await getDoctorById(doctorId);
    return res.status(response.statusCode).json(response);
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
    const { id: doctorId } = req.params;
    const userId = parseInt(req.user.id);

    const response = await approveDoctorProfile({
      doctorId,
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
