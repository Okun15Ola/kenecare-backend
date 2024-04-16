const logger = require("../../middlewares/logger.middleware");
const path = require("path");
const {
  getDoctorCouncilRegistration,
  createDoctorCouncilRegistration,
  updateDoctorCouncilRegistration,
} = require("../../services/doctors.council-registration.services");
const {
  getDoctorByUserId,
  getCouncilRegistrationByDoctorId,
} = require("../../db/db.doctors");
const Response = require("../../utils/response.utils");

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
const GetDoctorCouncilRegistrationDocumentController = async (
  req,
  res,
  next
) => {
  try {
    const { id: loggedInUserId } = req.user;
    const doctor = await getDoctorByUserId(loggedInUserId);

    if (!doctor) {
      return res.status(404).json(
        Response.NOT_FOUND({
          message: "Doctor Profile Not Found for Logged In Account",
        })
      );
    }
    const { doctor_id: doctorId, user_id: userId } = doctor;

    if (userId !== loggedInUserId) {
      return UNAUTHORIZED({ message: "Access Forbidden" });
    }

    //TODO Get document by doctorId AND Filename

    const registration = await getCouncilRegistrationByDoctorId(doctorId);
    if (!registration) {
      return res
        .status(404)
        .json(Response.NOT_FOUND({ message: "Document Not Found" }));
    }

    //TODO Check if the registration belongs to the requesting doctor
    return res.sendFile(
      path.join(__dirname, `../../public/upload/media/${req.params.filename}`)
    );
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
    console.error(error);
    logger.error(error);
    next(error);
  }
};

module.exports = {
  GetDoctorCouncilRegistrationController,
  GetDoctorCouncilRegistrationDocumentController,
  UpdateCouncilRegistrationController,
  CreateDoctorCouncilRegistration,
};
