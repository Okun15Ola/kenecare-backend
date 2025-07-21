const logger = require("../../middlewares/logger.middleware");
const {
  getAdminAppointments,
  getAdminAppointmentById,
  getAdminAppointmentsByDoctorId,
} = require("../../services/admin/admin.appointments.services");

exports.GetAdminAppointmentsController = async (req, res, next) => {
  try {
    const { limit, page } = req.query;
    const response = await getAdminAppointments({
      limit,
      page,
    });
    return res.status(response.statusCode).json(response);
  } catch (error) {
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
    logger.error(error);
    return next(error);
  }
};
exports.GetAdminAppointmentsByDoctorIdController = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { limit, page } = req.query;
    const response = await getAdminAppointmentsByDoctorId(id, limit, page);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};
