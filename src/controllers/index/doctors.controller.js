const Response = require("../../utils/response.utils");
const logger = require("../../middlewares/logger.middleware");
const {
  getAllDoctors,
  getDoctorByUserId,
  getDoctorByQuery,
} = require("../../services/doctors.services.js");
const { getDoctorById } = require("../../db/db.doctors.js");

exports.GetDoctorsController = async (req, res, next) => {
  try {
    let response = null;
    if (Object.keys(req.query).length > 0) {
      const { locationId, q: query } = req.query;
      //GET DOCTORS BY LOCATION
      response = await getDoctorByQuery({ locationId, query });
    } else {
      //GET ALL DOCTORS.
      response = await getAllDoctors();
    }

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
