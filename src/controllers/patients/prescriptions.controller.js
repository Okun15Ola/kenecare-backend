const logger = require("../../middlewares/logger.middleware");
const {
  getAppointmentPrescriptions,

  getAppointmentPrescriptionById,
} = require("../../services/patients.prescriptions.services");

const GetAppointmentPrescriptionsController = async (req, res, next) => {
  try {
    const appointmentId = parseInt(req.params.id);
    const response = await getAppointmentPrescriptions(appointmentId);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
const GetAppointmentPrescriptionController = async (req, res, next) => {
  try {
    const presId = parseInt(req.params.id);
    const { token: accessToken } = req.body;

    const response = await getAppointmentPrescriptionById({
      presId,
      accessToken,
    });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};

module.exports = {
  GetAppointmentPrescriptionsController,
  GetAppointmentPrescriptionController,
};
