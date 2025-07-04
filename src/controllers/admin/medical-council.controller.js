const logger = require("../../middlewares/logger.middleware");
const {
  getMedicalCouncils,
  getMedicalCouncil,
  // getMedicalCouncilByEmail,
  // getMedicalCouncilByMobileNumber,
  createMedicalCouncil,
  updateMedicalCouncil,
  updateMedicalCouncilStatus,
  deleteMedicalCouncil,
} = require("../../services/medical-councils.services");

exports.GetMedicalCouncilsController = async (req, res, next) => {
  try {
    const {
      pagination: { limit, offset },
      paginationInfo,
    } = req;
    const response = await getMedicalCouncils(limit, offset, paginationInfo);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    return next(error);
  }
};
exports.GetMedicalCouncilByIDController = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const response = await getMedicalCouncil(id);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    return next(error);
  }
};
exports.CreateMedicalCouncilController = async (req, res, next) => {
  try {
    const inputtedBy = 1;
    const { name, email, mobileNumber, address } = req.body;
    const response = await createMedicalCouncil({
      name,
      email,
      mobileNumber,
      address,
      inputtedBy,
    });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    return next(error);
  }
};

exports.UpdateMedicalCouncilByIdController = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, email, mobileNumber, address } = req.body;
    const response = await updateMedicalCouncil({
      id,
      name,
      email,
      mobileNumber,
      address,
    });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    return next(error);
  }
};
exports.UpdateMedicalCouncilStatusController = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const status = parseInt(req.query.status, 10);
    const response = await updateMedicalCouncilStatus({ id, status });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    return next(error);
  }
};

exports.DeleteMedicalCouncilByIdController = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const response = await deleteMedicalCouncil(id);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    return next(error);
  }
};
