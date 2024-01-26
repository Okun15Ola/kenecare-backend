const logger = require("../../middlewares/logger.middleware");
const {
  getMedicalCouncils,
  getMedicalCouncil,
} = require("../../services/medical-councils.services");
exports.GetMedicalCouncilsController = async (req, res, next) => {
  try {
    const response = await getMedicalCouncils();
    response.data = response.data.map(
      ({ councilId, councilName, email, address, mobileNumber }) => {
        return { councilId, councilName, email, address, mobileNumber };
      }
    );
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
exports.GetMedicalCouncilByIDController = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const response = await getMedicalCouncil(id);
    response.data = response.data.map(
      ({ councilId, councilName, email, address, mobileNumber }) => {
        return { councilId, councilName, email, address, mobileNumber };
      }
    );
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
