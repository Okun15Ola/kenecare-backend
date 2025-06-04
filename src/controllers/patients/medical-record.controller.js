const logger = require("../../middlewares/logger.middleware");
const {
  createPatientMedicalDocument,
  getPatientMedicalDocuments,
  getPatientMedicalDocument,
  deletePatientMedicalDocument,
  updatePatientMedicalDocument,
  createPatientSharedMedicalDocument: sharePatientMedicalDocument,
  getPatientSharedMedicalDocuments,
  getPatientSharedMedicalDocument,
  deletePatientSharedMedicalDocument,
} = require("../../services/patients/patients.documents.services");

exports.GetAllMedicalRecordsController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id, 10);
    const response = await getPatientMedicalDocuments(userId);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    return next(error);
  }
};
exports.GetMedicalRecordByIDController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id, 10);
    const docId = parseInt(req.params.id, 10);
    const response = await getPatientMedicalDocument({ docId, userId });

    // const { documentTitle, mimeType, documentBuffer } = response.data;
    // if (documentBuffer) {
    //   res.set({
    //     "Content-Type": `${mimeType}`,
    //     "Content-Disposition": `attachment; filename=${documentTitle}`,
    //   });
    //   return res.status(response.statusCode).send(documentBuffer);
    // }
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    return next(error);
  }
};
exports.CreateMedicalRecordController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id, 10);
    const file = req.file || null;
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
    return next(error);
  }
};

exports.UpdateMedicalRecordByIdController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id, 10);
    const docId = parseInt(req.params.id, 10);

    const file = req.file || null;
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
    return next(error);
  }
};

exports.DeletemedicaRecordByIdController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id, 10);
    const docId = parseInt(req.params.id, 10);
    const response = await deletePatientMedicalDocument({
      documentId: docId,
      userId,
    });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    return next(error);
  }
};

// medical document sharing
exports.ShareMedicalDocumentController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id, 10);

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
    return next(error);
  }
};

exports.GetAllSharedMedicalDocumentsController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id, 10);

    const response = await getPatientSharedMedicalDocuments(userId);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    return next(error);
  }
};
exports.GetSharedMedicalDocumentByIDController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id, 10);

    const documentId = parseInt(req.params.id, 10);

    const response = await getPatientSharedMedicalDocument({
      userId,
      documentId,
    });

    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    return next(error);
  }
};

exports.UpdateSharedMedicalDocumentByIdController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id, 10);

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
    return next(error);
  }
};

exports.DeleteSharedMedicalDocumentByIdController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id, 10);

    const documentId = parseInt(req.params.id, 10);

    const response = await deletePatientSharedMedicalDocument({
      userId,
      documentId,
    });

    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    return next(error);
  }
};
