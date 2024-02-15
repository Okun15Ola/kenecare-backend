const Response = require("../../utils/response.utils");
const logger = require("../../middlewares/logger.middleware");
const {
  getSpecialties,
  getSpecialtyById,
  getSpecialtyByName,
  createSpecialty,
  updateSpecialty,
  updateSpecialtyStatus,
  deleteSpecialty,
} = require("../../services/specialties.services");
const { localMediaUploader } = require("../../utils/file-upload.utils");
const path = require("path");
localMediaUploader.single("image");

exports.GetSpecialtiesController = async (req, res, next) => {
  try {
    const response = await getSpecialties();
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
exports.GetSpecialtyByIDController = async (req, res, next) => {
  try {
    const { id } = req.params;

    const response = await getSpecialtyById(id);

    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
exports.CreateSpecialtyController = async (req, res, next) => {
  try {
    if (req.file) {
      const userId = parseInt(req.user.id);
      const image = req.file.filename;
      const { name, description } = req.body;
      const response = await createSpecialty({
        name,
        description,
        image,
        inputtedBy: userId,
      });
      return res.status(response.statusCode).json(response);
    }
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};

exports.UpdateSpecialtyByIdController = async (req, res, next) => {
  try {
    if (req.file) {
      const image = req.file.filename;
      const id = parseInt(req.params.id);
      const { name, description } = req.body;

      const response = await updateSpecialty({
        id,
        name,
        image,
        description,
      });
      return res.status(response.statusCode).json(response);
    }
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
exports.UpdateSpecialtyStatusController = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const status = parseInt(req.query.status);

    const response = await updateSpecialtyStatus({
      id,
      status,
    });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};

exports.DeleteSpecialtyByIdController = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    const response = await deleteSpecialty(id);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
