const logger = require("../../middlewares/logger.middleware");
const {
  getDoctorByUser,
  getDoctorCouncilRegistration,
  createDoctorProfile,
  createDoctorCouncilRegistration,
  updateDoctorProfile,
  updateDoctorProfilePicture,
} = require("../../services/doctors.services");

const GetDoctorProfileController = async (req, res, next) => {
  try {
    const id = parseInt(req.user.id);
    const response = await getDoctorByUser(id);
    console.log(response);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
const GetDoctorCouncilRegistrationController = async (req, res, next) => {
  try {
    const id = parseInt(req.user.id);
    const response = await getDoctorCouncilRegistration(id);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
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
      yearOfExperience: yearOfExperience,
    });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
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
    console.error(error);
    logger.error(error);
    next(error);
  }
};
const UpdateDoctorProfileByIdController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id);
    const doctorId = parseInt(req.params.id);
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
      doctorId,
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
      yearOfExperience: yearOfExperience,
    });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
const UpdateDoctorProfilePictureController = async (req, res, next) => {
  try {
    if (req.file) {
      const doctorId = parseInt(req.params.id);
      const response = await up;

      return res.sendStatus(200);
    }
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
module.exports = {
  GetDoctorProfileController,
  GetDoctorCouncilRegistrationController,
  CreateDoctorProfileController,
  CreateDoctorCouncilRegistration,
  UpdateDoctorProfileByIdController,
  UpdateDoctorProfilePictureController,
};
