const logger = require("../../middlewares/logger.middleware");
const {
  getSpecialties,
  getSpecialtyById,
  // getSpecialtyByName,
  createSpecialty,
  updateSpecialty,
  updateSpecialtyStatus,
  deleteSpecialty,
} = require("../../services/specialties.services");
const { localMediaUploader } = require("../../utils/file-upload.utils");

localMediaUploader.single("image");

exports.GetSpecialtiesController = async (req, res, next) => {
  try {
    const { limit, page } = req.query;
    const response = await getSpecialties(limit, page);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};
exports.GetSpecialtyByIDController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const response = await getSpecialtyById(id);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};
exports.CreateSpecialtyController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id, 10);
    const image = req.file || null;
    const { name, description } = req.body;
    const response = await createSpecialty({
      name,
      description,
      image,
      inputtedBy: userId,
    });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

exports.UpdateSpecialtyByIdController = async (req, res, next) => {
  try {
    const image = req.file || null;
    const id = parseInt(req.params.id, 10);
    const { name, description } = req.body;
    const response = await updateSpecialty({
      id,
      name,
      image,
      description,
    });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};
exports.UpdateSpecialtyStatusController = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const status = parseInt(req.query.status, 10);
    const response = await updateSpecialtyStatus({
      id,
      status,
    });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

exports.DeleteSpecialtyByIdController = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const response = await deleteSpecialty(id);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};
