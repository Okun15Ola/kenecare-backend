const logger = require("../../middlewares/logger.middleware");
const {
  getAppointmentPrescriptions,

  getAppointmentPrescriptionById,
} = require("../../services/patients/patients.prescriptions.services");

const GetAppointmentPrescriptionsController = async (req, res, next) => {
  try {
    const {
      pagination: { limit, offset },
      paginationInfo,
    } = req;
    const appointmentId = parseInt(req.params.id, 10);
    const response = await getAppointmentPrescriptions(
      appointmentId,
      limit,
      offset,
      paginationInfo,
    );
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};
const GetAppointmentPrescriptionController = async (req, res, next) => {
  try {
    const presId = parseInt(req.params.id, 10);

    const response = await getAppointmentPrescriptionById(presId);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

module.exports = {
  GetAppointmentPrescriptionsController,
  GetAppointmentPrescriptionController,
};
