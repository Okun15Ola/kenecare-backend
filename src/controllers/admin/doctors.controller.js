const logger = require("../../middlewares/logger.middleware");
const {
  getAllDoctors,
  getDoctorById,
  // getDoctorsCouncilRegistration,
  // getDoctorByUserId,
  approveDoctorProfile,
} = require("../../services/doctors/doctors.services");

exports.GetDoctorsController = async (req, res, next) => {
  try {
    const {
      pagination: { limit, offset },
      paginationInfo,
    } = req;
    const response = await getAllDoctors(limit, offset, paginationInfo);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    return next(error);
  }
};
exports.GetDoctorsCouncilRegistrationController = async (req, res, next) => {
  try {
    const {
      pagination: { limit, offset },
      paginationInfo,
    } = req;
    const response = await getAllDoctors(limit, offset, paginationInfo);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    return next(error);
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
    return next(error);
  }
};
exports.CreateDoctorController = async (req, res, next) => {
  try {
    return res.send("Created Doctor");
  } catch (error) {
    console.error(error);
    logger.error(error);
    return next(error);
  }
};

exports.UpdateDoctorByIdController = async (req, res, next) => {
  try {
    return res.send("Updated Doctor");
  } catch (error) {
    console.error(error);
    logger.error(error);
    return next(error);
  }
};
exports.ApproveDoctorAccountController = async (req, res, next) => {
  try {
    const { id: doctorId } = req.params;
    const userId = parseInt(req.user.id, 10);

    const response = await approveDoctorProfile({
      doctorId,
      approvedBy: userId,
    });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    return next(error);
  }
};

exports.DeleteDoctorByIdController = async (req, res, next) => {
  try {
    return res.send("Deleted Doctor");
  } catch (error) {
    console.error(error);
    logger.error(error);
    return next(error);
  }
};
