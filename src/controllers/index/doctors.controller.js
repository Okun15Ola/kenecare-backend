const Response = require("../../utils/response.utils");
const logger = require("../../middlewares/logger.middleware");
const {
  getAllDoctors,
  getDoctorByUserId,
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