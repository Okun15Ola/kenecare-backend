const logger = require("../../middlewares/logger.middleware");
const {
  getDoctorCouncilRegistration,
  createDoctorCouncilRegistration,
  updateDoctorCouncilRegistration,
} = require("../../services/doctors/doctors.council-registration.services");

const GetDoctorCouncilRegistrationController = async (req, res, next) => {
  try {
    const id = parseInt(req.user.id, 10);
    const response = await getDoctorCouncilRegistration(id);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

const GetDoctorCouncilRegistrationDocumentController = async (
  req,
  res,
  next,
) => {
  try {
    const id = parseInt(req.user.id, 10);
    const response = await getDoctorCouncilRegistration(id);
    if (!response.data) {
      return res.status(response.statusCode).json(response);
    }

    const { registrationId, regDocumentUrl } = response.data;

    const data = {
      registrationId,
      regDocumentUrl,
    };
    return res.status(response.statusCode).json(data);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

const CreateDoctorCouncilRegistration = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { file } = req;
    const { councilId, regNumber, regYear, certIssuedDate, certExpiryDate } =
      req.body;

    const response = await createDoctorCouncilRegistration({
      userId,
      councilId,
      regNumber,
      regYear,
      certIssuedDate,
      certExpiryDate,
      file,
    });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};
const UpdateCouncilRegistrationController = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const { file } = req;
    const { councilId, regNumber, regYear, certIssuedDate, certExpiryDate } =
      req.body;

    const response = await updateDoctorCouncilRegistration({
      userId,
      councilId,
      regNumber,
      regYear,
      certIssuedDate,
      certExpiryDate,
      file,
    });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

module.exports = {
  GetDoctorCouncilRegistrationController,
  GetDoctorCouncilRegistrationDocumentController,
  UpdateCouncilRegistrationController,
  CreateDoctorCouncilRegistration,
};
