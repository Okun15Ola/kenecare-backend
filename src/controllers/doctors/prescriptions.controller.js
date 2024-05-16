const logger = require("../../middlewares/logger.middleware");
const {
  getAppointmentPrescriptions,
  createPrescription,
  updatePrescriptions,
  getAppointmentPrescriptionById,
} = require("../../services/prescriptions.services");

const GetPrescriptionsController = async (req, res, next) => {
  try {
    const id = parseInt(req.user.id);
    const response = await getAppointmentPrescriptions(id);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};

const GetAppointmentPrescriptionController = async (req, res, next) => {
  try {
    const prescriptionId = parseInt(req.params.id);

    const response = await getAppointmentPrescriptionById(prescriptionId);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
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

const CreatePrescriptionController = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const { appointmentId, diagnosis, medicines, comment } = req.body;

    const response = await createPrescription({
      userId,
      appointmentId,
      diagnosis,
      medicines,
      comment,
    });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
const UpdatePrescriptionController = async (req, res, next) => {
  try {
    const prescriptionId = parseInt(req.params.id);

    const { appointmentId, diagnosis, medicines, comment } = req.body;

    const response = await updatePrescriptions({
      prescriptionId,
      appointmentId,
      diagnosis,
      medicines,
      comment,
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
  CreatePrescriptionController,
  GetPrescriptionsController,
  UpdatePrescriptionController,
};
