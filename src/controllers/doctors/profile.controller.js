const logger = require("../../middlewares/logger.middleware");
const {
  getDoctorByUser,
  getDoctorCouncilRegistration,
  createDoctorProfile,
  createDoctorCouncilRegistration,
  updateDoctorProfile,
  updateDoctorProfilePicture,
} = require("../../services/doctors/doctors.services");

const GetDoctorProfileController = async (req, res, next) => {
  try {
    const id = parseInt(req.user.id, 10);
    const response = await getDoctorByUser(id);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};
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

const CreateDoctorProfileController = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      title,
      firstname,
      middlename,
      lastname,
      gender,
      profileSummary,
      specialization,
      qualifications,
      consultationfee,
      city,
      yearOfExperience,
    } = req.body;
    const response = await createDoctorProfile({
      userId,
      title,
      firstName: firstname,
      middleName: middlename,
      lastName: lastname,
      gender,
      professionalSummary: profileSummary,
      specializationId: specialization,
      qualifications,
      consultationFee: consultationfee,
      cityId: city,
      yearOfExperience,
    });
    return res.status(response.statusCode).json(response);
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
    const registrationId = parseInt(req.params.id, 10);

    const { file } = req;
    const { councilId, regNumber, regYear, certIssuedDate, certExpiryDate } =
      req.body;

    const response = await createDoctorCouncilRegistration({
      userId,
      registrationId,
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

const UpdateDoctorProfileByIdController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id, 10);

    const {
      title,
      firstname,
      middlename,
      lastname,
      gender,
      profileSummary,
      specialization,
      qualifications,
      consultationfee,
      city,
      yearOfExperience,
    } = req.body;

    const response = await updateDoctorProfile({
      userId,
      title,
      firstName: firstname,
      middleName: middlename,
      lastName: lastname,
      gender,
      professionalSummary: profileSummary,
      specializationId: specialization,
      qualifications,
      consultationFee: consultationfee,
      cityId: city,
      yearOfExperience,
    });

    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};
const UpdateDoctorProfilePictureController = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { file } = req || null;
    const response = await updateDoctorProfilePicture({
      userId: id,
      file,
    });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};
module.exports = {
  GetDoctorProfileController,
  GetDoctorCouncilRegistrationController,
  UpdateCouncilRegistrationController,
  CreateDoctorProfileController,
  CreateDoctorCouncilRegistration,
  UpdateDoctorProfileByIdController,
  UpdateDoctorProfilePictureController,
};
