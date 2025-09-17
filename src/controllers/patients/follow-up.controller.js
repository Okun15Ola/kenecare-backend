const logger = require("../../middlewares/logger.middleware");
const followUp = require("../../services/patients/appointment-followup.services");

exports.getPatientAppointmentFollowUpController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const response = await followUp.getPatientAppointmentFollowupService({
      appointmentId: id,
    });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};
