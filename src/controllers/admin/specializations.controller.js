const logger = require("../../middlewares/logger.middleware");
const {
  getSpecializations,
  getSpecializationById,
  createSpecialization,
  updateSpecialization,
  deleteSpecialization,
  updateSpecializationStatus,
} = require("../../services/admin/specializations.services");

exports.GetSpecializationsController = async (req, res, next) => {
  try {
    const {
      pagination: { limit, offset },
      paginationInfo,
    } = req;
    const response = await getSpecializations(limit, offset, paginationInfo);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};
exports.GetSpecializationByIDController = async (req, res, next) => {
  try {
    const { id } = req.params;

    const response = await getSpecializationById(id);

    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};
exports.CreateSpecializationController = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const imageUrl = "https://example.com/cardiology.jpg";
    // if (req.file) {
    //   console.log("File exist");
    // }
    const response = await createSpecialization({
      name,
      description,
      imageUrl,
    });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

exports.UpdateSpecializationByIdController = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const { id } = req.params;
    const transformedId = parseInt(id, 10);

    const imageUrl = "https://example.com/cardiology.jpg";
    // if (req.file) {
    //   console.log("File exist");
    // }
    const specialization = {
      name,
      description,
      imageUrl,
    };
    const response = await updateSpecialization({
      specializationId: transformedId,
      specialization,
    });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};
exports.UpdateSpecializationStatusController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.query;

    const transformedId = parseInt(id, 10);
    const transformedStatus = parseInt(status, 10);

    const response = await updateSpecializationStatus({
      specializationId: transformedId,
      status: transformedStatus,
    });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

exports.DeleteSpecializationByIdController = async (req, res, next) => {
  try {
    const { id } = req.params;

    const transformedId = parseInt(id, 10);

    const response = await deleteSpecialization(transformedId);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};
