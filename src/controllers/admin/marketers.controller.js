const logger = require("../../middlewares/logger.middleware");
const {
  getAllMarketersService,
  getMarketerByIdService,
  createMarketerService,
  updateMarketerByIdService,
  deleteMarketerByIdService,
  verifyMarketerPhoneNumberService,
  verifyMarketerEmailService,
} = require("../../services/admin/marketers.services");

exports.GetAllMarketersController = async (req, res, next) => {
  try {
    const response = await getAllMarketersService();

    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    return next(error);
  }
};
exports.GetMarketerByIdController = async (req, res, next) => {
  try {
    const marketerId = Number(req.params.id);
    const response = await getMarketerByIdService(marketerId);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    return next(error);
  }
};
exports.CreateMarketerController = async (req, res, next) => {
  try {
    const idDocumentFile = req.file;

    const {
      firstName,
      middleName,
      lastName,
      gender,
      dateOfBirth,
      phoneNumber,
      email,
      homeAddress,
      idDocumentType,
      idDocumentNumber,
      nin,
      firstEmergencyContactName,
      firstEmergencyContactNumber,
      firstEmergencyContactAddress,
      secondEmergencyContactName,
      secondEmergencyContactNumber,
      secondEmergencyContactAddress,
    } = req.body;

    const response = await createMarketerService({
      firstName,
      middleName,
      lastName,
      gender,
      dateOfBirth,
      phoneNumber,
      email,
      homeAddress,
      idDocumentType,
      idDocumentFile,
      idDocumentNumber,
      nin,
      firstEmergencyContactName,
      firstEmergencyContactNumber,
      firstEmergencyContactAddress,
      secondEmergencyContactName,
      secondEmergencyContactNumber,
      secondEmergencyContactAddress,
    });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    return next(error);
  }
};

exports.VerifyMarketerPhoneNumberController = async (req, res, next) => {
  try {
    const token = Number(req.query?.token);
    const response = await verifyMarketerPhoneNumberService(token);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    return next(error);
  }
};
exports.VerifyMarketerEmailController = async (req, res, next) => {
  try {
    const token = req.query?.token;

    const response = await verifyMarketerEmailService(token);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    return next(error);
  }
};
exports.UpdateMarketerController = async (req, res, next) => {
  try {
    const marketerId = Number(req.params.id);
    const {
      firstName,
      middleName,
      lastName,
      gender,
      dateOfBirth,
      phoneNumber,
      email,
      homeAddress,
      idDocumentType,
      idDocument,
      idDocumentNumber,
      nin,
      firstEmergencyContactName,
      firstEmergencyContactNumber,
      firstEmergencyContactAddress,
      secondEmergencyContactName,
      secondEmergencyContactNumber,
      secondEmergencyContacAddress,
    } = req.body;
    const response = await updateMarketerByIdService({
      marketerId,
      firstName,
      middleName,
      lastName,
      gender,
      dateOfBirth,
      phoneNumber,
      email,
      homeAddress,
      idDocumentType,
      idDocument,
      idDocumentNumber,
      nin,
      firstEmergencyContactName,
      firstEmergencyContactNumber,
      firstEmergencyContactAddress,
      secondEmergencyContactName,
      secondEmergencyContactNumber,
      secondEmergencyContacAddress,
    });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    return next(error);
  }
};
exports.DeleteMarketerController = async (req, res, next) => {
  try {
    const marketerId = Number(req.params.id);
    const response = await deleteMarketerByIdService(marketerId);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    return next(error);
  }
};
