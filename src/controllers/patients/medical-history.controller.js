const logger = require("../../middlewares/logger.middleware");
const {
  createPatientMedicalHistory,
  getPatientMedicalHistory,
  updatePatientMedicalHistory,
} = require("../../services/patients.medical-history.services");

exports.GetPatientMedicalHistoryController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id);
    const response = await getPatientMedicalHistory(userId);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};

exports.CreatePatientMedicalInfoController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id);
    const {
      height,
      weight,
      allergies,
      familyMedicalHistory,
      surgries,
      isDisabled,
      disabilityDesc,
      useTobacco,
      tobaccoIntakeFreq,
      alcoholIntake,
      alcoholIntakeFreq,
      caffineIntake,
      caffineIntakeFreq,
      reacreationalDrugIntake,
      reacreationalDrugIntakeFreq,
    } = req.body;
    const response = await createPatientMedicalHistory({
      userId,
      height,
      weight,
      allergies,
      familyMedicalHistory,
      surgries,
      isDisabled,
      disabilityDesc,
      useTobacco,
      tobaccoIntakeFreq,
      alcoholIntake,
      alcoholIntakeFreq,
      caffineIntake,
      caffineIntakeFreq,
      reacreationalDrugIntake,
      reacreationalDrugIntakeFreq,
    });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
exports.UpdatePatientMedicalHistoryController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id);
    const {
      height,
      weight,
      allergies,
      familyMedicalHistory,
      surgries,
      isDisabled,
      disabilityDesc,
      useTobacco,
      tobaccoIntakeFreq,
      alcoholIntake,
      alcoholIntakeFreq,
      caffineIntake,
      caffineIntakeFreq,
      reacreationalDrugIntake,
      reacreationalDrugIntakeFreq,
    } = req.body;
    const response = await updatePatientMedicalHistory({
      userId,
      height,
      weight,
      allergies,
      familyMedicalHistory,
      surgries,
      isDisabled,
      disabilityDesc,
      useTobacco,
      tobaccoIntakeFreq,
      alcoholIntake,
      alcoholIntakeFreq,
      caffineIntake,
      caffineIntakeFreq,
      reacreationalDrugIntake,
      reacreationalDrugIntakeFreq,
    });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
