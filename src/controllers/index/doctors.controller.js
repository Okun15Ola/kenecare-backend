const logger = require("../../middlewares/logger.middleware");
const {
  getAllDoctors,
  getDoctorById,
  getDoctorByUserId,
  getDoctorBySpecialtyId,
  getDoctorByQuery,
} = require("../../services/doctors.services.js");

exports.GetDoctorsController = async (req, res, next) => {
  try {
    let response = null;
    if (Object.keys(req.query).length > 0) {
      const {
        locationId,
        q: query,
        specialty_id: specialtyId,
      } = req.query || null;
      if (specialtyId) {
        response = await getDoctorBySpecialtyId(specialtyId);
      } else {
        //GET DOCTORS BY LOCATION
        response = await getDoctorByQuery({ locationId, query });
      }
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
    const doctorId = parseInt(req.params.id);
    const response = await getDoctorById(doctorId);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
