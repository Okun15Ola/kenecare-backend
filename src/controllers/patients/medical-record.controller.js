const logger = require("../../middlewares/logger.middleware");
const {
  createPatientMedicalDocument,
  getPatientMedicalDocuments,
  getPatientMedicalDocument,
  deletePatientMedicalDocument,
  updatePatientMedicalDocument,
} = require("../../services/patients.documents.services");
exports.GetAllMedicalRecordsController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id);
    const response = await getPatientMedicalDocuments(userId);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
exports.GetMedicalRecordByIDController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id);
    const docId = parseInt(req.params.id);
    const response = await getPatientMedicalDocument({ docId, userId });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
exports.CreateMedicalReocrdController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id);
    const { file } = req.file ? req : null;
    const { documentTitle } = req.body || null;

    const response = await createPatientMedicalDocument({
      userId,
      file,
      documentTitle,
    });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
exports.UpdateMedicalReocrdByIdController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id);
    const docId = parseInt(req.params.id);

    const { file } = req.file ? req : null;
    const { documentTitle } = req.body || null;

    const response = await updatePatientMedicalDocument({
      userId,
      file,
      docId,
      documentTitle,
    });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};

exports.DeletemedicaRecordByIdController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id);
    const docId = parseInt(req.params.id);
    const response = await deletePatientMedicalDocument({
      documentId: docId,
      userId,
    });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
