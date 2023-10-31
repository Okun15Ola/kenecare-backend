const logger = require("../../middlewares/logger.middleware");
const {
  getCommonSymptoms,
  getCommonSymptom,
  createCommonSymptom,
  updateCommonSymptom,
  updateCommonSymptomStatus,
  deleteCommonSymptom,
} = require("../../services/common-symptoms.services");
const {
  localMediaUploader: mediaUploaded,
} = require("../../utils/file-upload.utils");
const upload = mediaUploaded.single("image");

exports.GetCommonSymptomsController = async (req, res, next) => {
  try {
    const response = await getCommonSymptoms();
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
exports.GetCommonSymptomByIDController = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const response = await getCommonSymptom(id);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
exports.CreateCommonSymptomController = async (req, res, next) => {
  try {
    return res.sendStatus(200);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};

exports.UpdateCommonSymptomByIdController = async (req, res, next) => {
  try {
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
exports.UpdateCommonSymptomStatusController = async (req, res, next) => {
  try {
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};

exports.DeleteCommonSymptomByIdController = async (req, res, next) => {
  try {
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
