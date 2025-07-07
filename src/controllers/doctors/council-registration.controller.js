const path = require("path");
const logger = require("../../middlewares/logger.middleware");
const {
  getDoctorCouncilRegistration,
  createDoctorCouncilRegistration,
  updateDoctorCouncilRegistration,
} = require("../../services/doctors/doctors.council-registration.services");
const {
  getDoctorByUserId,
  getCouncilRegistrationByDoctorId,
} = require("../../repository/doctors.repository");
const Response = require("../../utils/response.utils");

const GetDoctorCouncilRegistrationController = async (req, res, next) => {
  try {
    const id = parseInt(req.user.id, 10);
    const response = await getDoctorCouncilRegistration(id);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    return next(error);
  }
};
// TODO: decouple this fn
const GetDoctorCouncilRegistrationDocumentController = async (
  req,
  res,
  next,
) => {
  try {
    const { id: loggedInUserId } = req.user;
    const doctor = await getDoctorByUserId(loggedInUserId);

    if (!doctor) {
      return res.status(404).json(
        Response.NOT_FOUND({
          message: "Doctor Profile Not Found for Logged In Account",
        }),
      );
    }
    const { doctor_id: doctorId, user_id: userId } = doctor;

    if (userId !== loggedInUserId) {
      return Response.UNAUTHORIZED({ message: "Access Forbidden" });
    }

    //  Get document by doctorId AND Filename

    const registration = await getCouncilRegistrationByDoctorId(doctorId);
    if (!registration) {
      return res
        .status(404)
        .json(Response.NOT_FOUND({ message: "Document Not Found" }));
    }

    //  Check if the registration belongs to the requesting doctor
    return res.sendFile(
      path.join(__dirname, `../../public/upload/media/${req.params.filename}`),
    );
  } catch (error) {
    console.error(error);
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
    console.error(error);
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
    console.error(error);
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
