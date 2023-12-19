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

    response.data = response.data.map(
      ({ specialtyId, specialtyName, description, imageUrl }) => {
        return { specialtyId, specialtyName, description, imageUrl };
      }
    );

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
