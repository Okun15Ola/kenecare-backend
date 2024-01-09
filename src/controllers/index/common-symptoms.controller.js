const logger = require("../../middlewares/logger.middleware");
const {
  getCommonSymptoms,
  getCommonSymptom,
} = require("../../services/common-symptoms.services");
const {
  localMediaUploader: mediaUploaded,
} = require("../../utils/file-upload.utils");
const upload = mediaUploaded.single("image");

exports.GetCommonSymptomsController = async (req, res, next) => {
  try {
    const response = await getCommonSymptoms();

    response.data = response.data.map(
      ({
        symptomId,
        name,
        imageUrl,
        description,
        tags,
        consultationFee,
        specialty,
      }) => {
        return {
          symptomId,
          name,
          imageUrl,
          description,
          consultationFee,
          specialty,
          tags,
        };
      }
    );

    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
exports.GetCommonSymptomByIDController = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const response = await getCommonSymptom(id);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
