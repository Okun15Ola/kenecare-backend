const dbObject = require("../../repository/doctors.repository");
const Response = require("../../utils/response.utils");
const logger = require("../../middlewares/logger.middleware");

// DOCTORS
exports.getDoctorAvailableDays = async (id) => {
  try {
    // Get profile from database
    const doctors = await dbObject.getDoctorByUserId(id);

    if (!doctors) {
      return Response.NOT_FOUND({
        message: "Doctor's Available Days Not Found",
      });
    }

    return Response.SUCCESS();
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

exports.createDoctorAvailableDays = async () => {
  try {
    return Response.SUCCESS();
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

exports.updateDoctorAvailableDays = async () => {
  try {
    return Response.SUCCESS();
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

exports.getDoctorTimeSlots = async () => {
  try {
    return Response.SUCCESS();
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
