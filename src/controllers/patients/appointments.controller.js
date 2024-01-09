const logger = require("../../middlewares/logger.middleware");
const {
  getPatientAppointment,
  getPatientAppointments,
  createPatientAppointment,
} = require("../../services/patients.appointments.services");

exports.GetAppointmentsController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id);
    const response = await getPatientAppointments(userId);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
exports.GetAppointmentsByIDController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const response = await getAppointment(id);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
exports.CreateAppointmentController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id);

    const {
      patientName,
      patientNumber,
      doctorId,
      specialtyId,
      symptoms,
      appointmentType,
      appointmentDate,
      appointmentTime,
      timeSlotId,
    } = req.body;
    const response = await createPatientAppointment({
      userId,
      patientName,
      patientNumber,
      appointmentType,
      doctorId,
      specialtyId,
      symptoms,
      appointmentDate,
      appointmentTime,
      timeSlotId,
    });



    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
exports.UpdatePatientMedicalAppointmentByIdController = async (
  req,
  res,
  next
) => {
  try {
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
exports.UpdatePatientMedicalAppointmentStatusController = async (
  req,
  res,
  next
) => {
  try {
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
// exports.DeleteTestimonialByIdController = async (req, res, next) => {
//   try {
//   } catch (error) {
//     console.error(error);
//     logger.error(error);
//     next(error);
//   }
// };
