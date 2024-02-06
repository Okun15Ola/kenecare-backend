const logger = require("../../middlewares/logger.middleware");
const {
  getPatientAppointment,
  getPatientAppointments,
  createPatientAppointment,
} = require("../../services/patients.appointments.services");

exports.GetAppointmentsController = async (req, res, next) => {
  try {
    let page = req.query.page ? req.query.page : 1;
    let limit = req.query.limit ? req.query.limit : 20;

    const userId = parseInt(req.user.id);
    const response = await getPatientAppointments({ userId, page, limit });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
exports.GetAppointmentsByIDController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id);
    const appointmentId = parseInt(req.params.id);

    const response = await getPatientAppointment({ userId, id: appointmentId });
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
