const logger = require("../../middlewares/logger.middleware");
const {
  getCommonSymptoms,
  getCommonSymptom,
  createCommonSymptom,
  updateCommonSymptom,
} = require("../../services/common-symptoms.services");

exports.GetCommonSymptomsController = async (req, res, next) => {
  try {
    const response = await getCommonSymptoms();
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    return next(error);
  }
};
exports.GetCommonSymptomByIDController = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const response = await getCommonSymptom(id);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    return next(error);
  }
};
exports.CreateCommonSymptomController = async (req, res, next) => {
  try {
    const { file } = req || null;
    const inputtedBy = parseInt(req.user.id, 10);
    const { name, description, specialtyId, tags, consultationFee } = req.body;
    const response = await createCommonSymptom({
      name,
      description,
      specialtyId,
      file,
      consultationFee,
      tags,
      inputtedBy,
    });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    return next(error);
  }
};

exports.UpdateCommonSymptomByIdController = async (req, res, next) => {
  try {
    const { file } = req || null;
    const inputtedBy = parseInt(req.user.id, 10);
    const id = parseInt(req.params.id, 10);
    const { name, description, specialtyId, tags, consultationFee } = req.body;
    const response = await updateCommonSymptom({
      id,
      name,
      description,
      specialtyId,
      file,
      consultationFee,
      tags,
      inputtedBy,
    });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    return next(error);
  }
};
exports.UpdateCommonSymptomStatusController = async (req, res, next) => {
  try {
    const { file } = req || null;
    const inputtedBy = parseInt(req.user.id, 10);
    const id = parseInt(req.params.id, 10);
    const { name, description, specialtyId, tags, consultationFee } = req.body;
    const response = await updateCommonSymptom({
      id,
      name,
      description,
      specialtyId,
      file,
      consultationFee,
      tags,
      inputtedBy,
    });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    return next(error);
  }
};

exports.DeleteCommonSymptomByIdController = async (req, res, next) => {
  try {
    const { file } = req || null;
    const inputtedBy = parseInt(req.user.id, 10);
    const id = parseInt(req.params.id, 10);
    const { name, description, specialtyId, tags, consultationFee } = req.body;
    const response = await updateCommonSymptom({
      id,
      name,
      description,
      specialtyId,
      file,
      consultationFee,
      tags,
      inputtedBy,
    });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    return next(error);
  }
};
