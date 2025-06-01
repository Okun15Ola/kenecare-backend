const logger = require("../../middlewares/logger.middleware");
const {
  getAdminAppointments,
  getAdminAppointmentById,
  getAdminAppointmentsByDoctorId,
} = require("../../services/admin/admin.appointments.services");

exports.GetAdminAppointmentsController = async (req, res, next) => {
  try {
    const response = await getAdminAppointments();
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    return next(error);
  }
};
exports.GetAdminAppointmentByIdController = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);

    const response = await getAdminAppointmentById(id);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    return next(error);
  }
};
exports.GetAdminAppointmentsByDoctorIdController = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);

    const response = await getAdminAppointmentsByDoctorId(id);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    return next(error);
  }
};
