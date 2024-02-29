const logger = require("../../middlewares/logger.middleware");
const {
  getDoctorSharedMedicalDocuments,
} = require("../../services/doctors.documents.services");

exports.GetAllSharedMedicalRecordsController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id);
    const response = await getDoctorSharedMedicalDocuments(userId);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
exports.GetSharedMedicalRecordByIDController = async (req, res, next) => {
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

//medical document sharing
exports.ShareMedicalDocumentController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id);

    const { documentId, doctorId, note } = req.body || null;

    const response = await sharePatientMedicalDocument({
      userId,
      documentId,
      doctorId,
      note,
    });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};

exports.GetAllSharedMedicalDocumentsController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id);

    const response = await getPatientSharedMedicalDocuments(userId);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
exports.GetSharedMedicalDocumentByIDController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id);

    const documentId = parseInt(req.params.id);

    const response = await getPatientSharedMedicalDocument({
      userId,
      documentId,
    });

    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};

exports.UpdateSharedMedicalDocumentByIdController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id);

    const { documentId, doctorId, note } = req.body || null;

    const response = await sharePatientMedicalDocument({
      userId,
      documentId,
      doctorId,
      note,
    });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};

exports.DeleteSharedMedicalDocumentByIdController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id);

    const documentId = parseInt(req.params.id);

    const response = await deletePatientSharedMedicalDocument({
      userId,
      documentId,
    });

    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
