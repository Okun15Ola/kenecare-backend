const logger = require("../../middlewares/logger.middleware");
const {
  getDoctorAppointments,
  getDoctorAppointment,
  postponeDoctorAppointment,
  approveDoctorAppointment,
  cancelDoctorAppointment,
  startDoctorAppointment,
  getDoctorAppointmentByDateRange,
} = require("../../services/doctor.appointments.services");

exports.GetDoctorAppointmentsController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id, 10);
    const startDate = req.query.startDate ? req.query.startDate : null;
    const endDate = req.query.endDate ? req.query.endDate : null;
    const page = req.query.page ? req.query.page : 1;
    const limit = req.query.limit ? req.query.limit : 20;

    if (startDate && endDate) {
      const response = await getDoctorAppointmentByDateRange({
        userId,
        startDate,
        endDate,
        page,
        limit,
      });
      return res.status(response.statusCode).json(response);
    }

    const response = await getDoctorAppointments({ userId, page, limit });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    return next(error);
  }
};
exports.GetDoctorAppointmentsByIDController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id, 10);
    const appointmentId = parseInt(req.params.id, 10);
    const response = await getDoctorAppointment({ userId, id: appointmentId });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    return next(error);
  }
};

exports.ApproveDoctorAppointmentController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id, 10);
    const appointmentId = parseInt(req.params.id, 10);
    const response = await approveDoctorAppointment({ userId, appointmentId });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    return next(error);
  }
};
exports.CancelDoctorAppointmentController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id, 10);
    const appointmentId = parseInt(req.params.id, 10);
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
    return next(error);
  }
};

exports.PostponeDoctorAppointmentController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id, 10);
    const appointmentId = parseInt(req.params.id, 10);
    const { reason: postponedReason, postponedDate: postponeDate } = req.body;

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
    return next(error);
  }
};
exports.StartDoctorAppointmentController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id, 10);
    const appointmentId = parseInt(req.params.id, 10);

    const response = await startDoctorAppointment({
      userId,
      appointmentId,
    });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    return next(error);
  }
};
