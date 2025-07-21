const logger = require("../../middlewares/logger.middleware");
const {
  createFollowUp,
  getAllAppointmentFollowupService,
  getFollowUpByIdService,
  updateAppointmentFollowUpService,
  deleteAppointmentFollowUpService,
} = require("../../services/doctors/follow-ups.services");

exports.CreateAppointmentFollowUpController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id, 10);
    const {
      appointmentId,
      followUpDate,
      followUpTime,
      followUpReason,
      followUpType,
    } = req.body;
    const response = await createFollowUp({
      appointmentId,
      followUpDate,
      followUpTime,
      followUpReason,
      followUpType,
      userId,
    });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

exports.UpdateAppointmentFollowUpController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id, 10);
    const followUpId = Number(req.params.id);
    const {
      appointmentId,
      followUpDate,
      followUpTime,
      followUpReason,
      followUpType,
    } = req.body;
    const response = await updateAppointmentFollowUpService({
      followUpId,
      appointmentId,
      followUpDate,
      followUpTime,
      followUpReason,
      followUpType,
      userId,
    });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

exports.DeleteAppointmentFollowUpController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id, 10);
    const followUpId = Number(req.params.id);

    const response = await deleteAppointmentFollowUpService({
      followUpId,
      userId,
    });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

exports.GetAppointmentFollowUpsController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id, 10);
    const appointmentId = Number(req.params.id);
    const response = await getAllAppointmentFollowupService({
      userId,
      appointmentId,
    });

    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

exports.GetFollowUpByIdController = async (req, res, next) => {
  try {
    const userId = Number(req.user.id);
    const followUpId = Number(req.params.id);
    const response = await getFollowUpByIdService({ id: followUpId, userId });

    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};
