const dbObject = require("../../db/db.doctors");
const Response = require("../../utils/response.utils");

// DOCTORS
exports.getDoctorAvailableDays = async (id) => {
  try {
    // Get profile from database
    const doctor = await dbObject.getDoctorByUserId(id);

    if (!doctor) {
      return Response.NOT_FOUND({ message: "Doctor Profile Not Found" });
    }

    return Response.SUCCESS();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.createDoctorAvailableDays = async () => {
  try {
    return Response.SUCCESS();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.updateDoctorAvailableDays = async () => {
  try {
    return Response.SUCCESS();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.getDoctorTimeSlots = async () => {
  try {
    return Response.SUCCESS();
  } catch (error) {
    console.error(error);
    throw error;
  }
};
