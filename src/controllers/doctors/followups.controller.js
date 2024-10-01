const logger = require("../../middlewares/logger.middleware");
const {
  createFollowUp,
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
    console.error(error);
    logger.error(error);
    return next(error);
  }
};

// exports.StartAppointmentFollowUpController = async (req, res, next) => {
//   try {
//     const userId = parseInt(req.user.id, 10);
//     const appointmentId = parseInt(req.params.id, 10);

//     const response = await startDoctorAppointment({
//       userId,
//       appointmentId,
//     });
//     return res.status(response.statusCode).json(response);
//   } catch (error) {
//     console.error(error);
//     logger.error(error);
//     return next(error);
//   }
// };
// exports.EndAppointmentFollowUpController = async (req, res, next) => {
//   try {
//     const userId = parseInt(req.user.id, 10);
//     const appointmentId = parseInt(req.params.id, 10);

//     const response = await endDoctorAppointment({
//       userId,
//       appointmentId,
//     });
//     return res.status(response.statusCode).json(response);
//   } catch (error) {
//     console.error(error);
//     logger.error(error);
//     return next(error);
//   }
// };
