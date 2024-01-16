const logger = require("../../middlewares/logger.middleware");
const {
  createMedicalDocument,
} = require("../../services/patients.documents.services");
exports.GetAllMedicalRecordsController = async (req, res, next) => {
  try {
    return res.send("Get All Patient's Medical Records");
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
exports.GetMedicalRecordByIDController = async (req, res, next) => {
  try {
    return res.send("Get Patient's Medical Record By ID");
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
    const response = await createMedicalDocument({ userId, file });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
exports.UpdateMedicalReocrdByIdController = async (req, res, next) => {
  try {
    return res.send("Update Patient's Medical Record By ID");
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};

exports.DeletemedicaRecordByIdController = async (req, res, next) => {
  try {
    return res.send("Update Patient's Medical Record By ID");
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
