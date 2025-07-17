const repo = require("../repository/common-symptoms.repository");
const Response = require("../utils/response.utils");
const { redisClient } = require("../config/redis.config");
const { uploadFileToS3Bucket } = require("../utils/aws-s3.utils");
const { generateFileName } = require("../utils/file-upload.utils");
const { mapCommonSymptomsRow } = require("../utils/db-mapper.utils");
const { cacheKeyBulider } = require("../utils/caching.utils");
const logger = require("../middlewares/logger.middleware");

exports.getCommonSymptoms = async (limit, offset, paginationInfo) => {
  try {
    const cacheKey = cacheKeyBulider("common-symptoms:all", limit, offset);
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({
        data: JSON.parse(cachedData),
        pagination: paginationInfo,
      });
    }

    const rawData = await repo.getAllCommonSymptoms(limit, offset);

    if (!rawData?.length) {
      logger.warn("Common Symptoms Not Found");
      return Response.NOT_FOUND({ message: "Common Symptom Not Found" });
    }

    const symptoms = await Promise.all(rawData.map(mapCommonSymptomsRow));

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(symptoms),
    });

    return Response.SUCCESS({ data: symptoms, pagination: paginationInfo });
  } catch (error) {
    logger.error("getCommonSymptoms: ", error);
    throw error;
  }
};

exports.getCommonSymptom = async (id) => {
  try {
    const cacheKey = `common-symptoms:${id}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }
    const rawData = await repo.getCommonSymptomById(id);
    if (!rawData) {
      logger.warn(`Common Symptom Not Found for ID ${id}`);
      return Response.NOT_FOUND({ message: "Common Symptom Not Found" });
    }

    const symptom = await mapCommonSymptomsRow(rawData);

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(symptom),
    });
    return Response.SUCCESS({ data: symptom });
  } catch (error) {
    logger.error("getCommonSymptom: ", error);
    throw error;
  }
};

exports.createCommonSymptom = async ({
  name,
  description,
  specialtyId,
  file,
  consultationFee,
  tags,
  inputtedBy,
}) => {
  try {
    if (!file) {
      logger.warn("Symptom image is required");
      return Response.BAD_REQUEST({ message: "Please upload symptom image" });
    }
    const fileName = `symptom_${generateFileName(file)}`;
    const { buffer, mimetype } = file;

    const [uploadResult, createSymptom] = await Promise.allSettled([
      uploadFileToS3Bucket({
        buffer,
        fileName,
        mimetype,
      }),
      repo.createNewCommonSymptom({
        name,
        description,
        specialtyId,
        file: fileName,
        consultationFee,
        tags,
        inputtedBy,
      }),
    ]);

    if (uploadResult.status === "rejected") {
      logger.error("File upload failed: ", uploadResult.reason);
      return Response.INTERNAL_SERVER_ERROR({
        message: "File upload failed. Please try again.",
      });
    }
    if (createSymptom.status === "rejected") {
      logger.error("Common Symptom creation failed: ", createSymptom.reason);
      return Response.INTERNAL_SERVER_ERROR({
        message: "Common Symptom creation failed. Please try again.",
      });
    }

    const cacheKey = cacheKeyBulider("common-symptoms:*");
    await redisClient.clearCacheByPattern(cacheKey);

    return Response.CREATED({
      message: "Common Symptom Created Successfully",
    });
  } catch (error) {
    logger.error("createCommonSymptom: ", error);
    throw error;
  }
};
exports.updateCommonSymptom = async ({
  id,
  name,
  description,
  specialtyId,
  file,
  consultationFee,
  tags,
}) => {
  try {
    const symptom = await repo.getCommonSymptomById(id);
    if (!symptom) {
      logger.warn(`Common Symptom Not Found for ID ${id}`);
      return Response.NOT_FOUND({ message: "Common Symptom not found" });
    }

    const { image_url: imageUrl } = symptom;

    const fileName = imageUrl || `symptom_${generateFileName(file)}`;
    if (file) {
      await uploadFileToS3Bucket({
        fileName,
        buffer: file.buffer,
        mimetype: file.mimetype,
      });
    }
    const { affectedRows } = await repo.updateCommonSymptomById({
      id,
      name,
      description,
      specialtyId,
      file: fileName,
      consultationFee,
      tags,
    });

    if (!affectedRows || affectedRows < 1) {
      logger.warn(`Failed to update Common Symptom for ID ${id}`);
      return Response.NOT_MODIFIED({});
    }

    const cacheKey = `common-symptoms:${id}`;
    await redisClient.delete(cacheKey);

    return Response.SUCCESS({
      message: "Common Symptom Updated Succcessfully",
    });
  } catch (error) {
    logger.error("updateCommonSymptom: ", error);
    throw error;
  }
};
exports.updateCommonSymptomStatus = async ({ id, status }) => {
  try {
    const symptom = await repo.getCommonSymptomById(id);
    if (!symptom) {
      logger.warn(`Common Symptom Not Found for ID ${id}`);
      return Response.NOT_FOUND({ message: "Common Symptom not found" });
    }

    console.log(status);
    return Response.SUCCESS({
      message: "Common Symptom Status Updated Successfully",
    });
  } catch (error) {
    logger.error("updateCommonSymptomStatus: ", error);
    throw error;
  }
};
exports.deleteCommonSymptom = async (id) => {
  try {
    const symptom = await repo.getCommonSymptomById(id);
    if (!symptom) {
      logger.warn(`Common Symptom Not Found for ID ${id}`);
      return Response.NOT_FOUND({ message: "Common Symptom not found" });
    }

    const { affectedRows } = await repo.deleteCommonSymptomById(id);

    if (!affectedRows || affectedRows < 1) {
      logger.warn(`Failed to delete Common Symptom for ID ${id}`);
      return Response.NOT_MODIFIED({});
    }

    const cacheKey = `common-symptoms:${id}`;
    await redisClient.delete(cacheKey);

    return Response.SUCCESS({ message: "Common Symptom Deleted Successfully" });
  } catch (error) {
    logger.error("deleteCommonSymptom: ", error);
    throw error;
  }
};
