const logger = require("../../middlewares/logger.middleware");
const {
  getPatientAppointment,
  getPatientAppointments,
  createPatientAppointment,
} = require("../../services/patients.appointments.services");

exports.GetAppointmentsController = async (req, res, next) => {
  try {
    const page = req.query.page ? req.query.page : 1;
    const limit = req.query.limit ? req.query.limit : 20;

    const userId = parseInt(req.user.id, 10);
    const response = await getPatientAppointments({ userId, page, limit });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    return next(error);
  }
};
exports.GetAppointmentsByIDController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id, 10);
    const appointmentId = parseInt(req.params.id, 10);

    const response = await getPatientAppointment({ userId, id: appointmentId });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    return next(error);
  }
};
exports.CreateAppointmentController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id, 10);

    const {
      patientName,
      patientNumber,
      doctorId,
      specialtyId,
      symptoms,
      appointmentType,
      appointmentDate,
      appointmentTime,
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
    });

    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    return next(error);
  }
};
exports.UpdatePatientMedicalAppointmentByIdController = async (
  req,
  res,
  next,
) => {
  try {
    return res.sendStatus(200);
  } catch (error) {
    console.error(error);
    logger.error(error);
    return next(error);
  }
};
exports.UpdatePatientMedicalAppointmentStatusController = async (
  req,
  res,
  next,
) => {
  try {
    return res.sendStatus(200);
  } catch (error) {
    console.error(error);
    logger.error(error);
    return next(error);
  }
};
