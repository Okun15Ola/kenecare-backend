const logger = require("../../middlewares/logger.middleware");
const {
  getPatientByUser,
  createPatientProfile,
  updatePatientProfile,
  updatePatientProfilePicture,
  getDoctorsPatientsHasMet,
} = require("../../services/patients/patients.services");

exports.GetPatientProfileController = async (req, res, next) => {
  try {
    const { id } = req.user;
    const response = await getPatientByUser(id);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

exports.GetDoctorsPatientsHasMetController = async (req, res, next) => {
  try {
    const { id } = req.user;
    const response = await getDoctorsPatientsHasMet(id);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

exports.CreatePatientProfileController = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { firstname, middlename, lastname, gender, dateOfBirth } = req.body;
    const response = await createPatientProfile({
      userId: id,
      firstName: firstname,
      middleName: middlename,
      lastName: lastname,
      gender,
      dateOfBirth: dateOfBirth || null,
    });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

exports.UpdatePatientProfileController = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { firstname, middlename, lastname, gender, dateOfBirth } = req.body;
    const response = await updatePatientProfile({
      userId: id,
      firstName: firstname,
      middleName: middlename,
      lastName: lastname,
      gender,
      dateOfBirth,
    });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};
exports.UpdatePatientProfilePictureController = async (req, res, next) => {
  try {
    const { id } = req.user;
    const file = req.file || null;

    const response = await updatePatientProfilePicture({
      userId: id,
      file,
    });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};
