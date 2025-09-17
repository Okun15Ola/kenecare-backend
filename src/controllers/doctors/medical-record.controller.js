const logger = require("../../middlewares/logger.middleware");
const {
  getDoctorSharedMedicalDocuments,
  getDoctorSharedMedicalDocument,
} = require("../../services/doctors/doctors.documents.services");

exports.GetAllSharedMedicalRecordsController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id, 10);
    const response = await getDoctorSharedMedicalDocuments(userId);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

exports.GetSharedMedicalRecordByIDController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id, 10);
    const sharingId = parseInt(req.body.id, 10);

    const response = await getDoctorSharedMedicalDocument({
      userId,
      sharedDocId: sharingId,
    });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};
