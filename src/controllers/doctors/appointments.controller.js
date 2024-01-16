const logger = require("../../middlewares/logger.middleware");
const {
  getDoctorAppointments,
  getDoctorAppointment,
  postponeDoctorAppointment,
  approveDoctorAppointment,
  cancelDoctorAppointment,
} = require("../../services/doctor.appointments.services");

exports.GetDoctorAppointmentsController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id);
    const response = await getDoctorAppointments(userId);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
exports.GetDoctorAppointmentsByIDController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id);
    const appointmentId = parseInt(req.params.id);
    const response = await getDoctorAppointment({ userId, appointmentId });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};

exports.ApproveDoctorAppointmentController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id);
    const appointmentId = parseInt(req.params.id);
    const response = await approveDoctorAppointment({ userId, appointmentId });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
exports.CancelDoctorAppointmentController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id);
    const appointmentId = parseInt(req.params.id);
    const { cancelationReason: cancelReason } = req.body;

    const response = await cancelDoctorAppointment({
      userId,
      appointmentId,
      cancelReason,
    });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};

exports.PostponeDoctorAppointmentController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id);
    const appointmentId = parseInt(req.params.id);
    const { postponeReason: postponedReason, postponedTo: postponeDate } =
      req.body;

    const response = await postponeDoctorAppointment({
      userId,
      appointmentId,
      postponeDate,
      postponedReason,
    });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
