const repo = require("../repository/common-symptoms.repository");
const Response = require("../utils/response.utils");
const redisClient = require("../config/redis.config");
const {
  getFileFromS3Bucket,
  uploadFileToS3Bucket,
  getFileUrlFromS3Bucket,
} = require("../utils/aws-s3.utils");
const { generateFileName } = require("../utils/file-upload.utils");

exports.getCommonSymptoms = async () => {
  try {
    const cacheKey = "common-symptoms:all";
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }

    const rawData = await repo.getAllCommonSymptoms();
    const promises = rawData.map(
      async ({
        symptom_id: symptomId,
        symptom_name: name,
        symptom_descriptions: description,
        speciality_name: specialty,
        image_url: imageUrl,
        general_consultation_fee: consultationFee,
        tags,
        is_active: isActive,
        inputted_by: inputtedBy,
      }) => {
        const url = await getFileUrlFromS3Bucket(imageUrl);
        return {
          symptomId,
          name: name.toUpperCase(),
          description,
          specialty,
          imageUrl: url,
          consultationFee,
          tags,
          isActive,
          inputtedBy,
        };
      },
    );
    const symptoms = await Promise.all(promises);
    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(symptoms),
    });
    return Response.SUCCESS({ data: symptoms });
  } catch (error) {
    console.error("GET ALL COMMON SYMPTOMS ERROR: ", error);
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
      return Response.NOT_FOUND({ message: "Common Symptom Not Found" });
    }
    const {
      symptom_id: symptomId,
      symptom_name: name,
      symptom_descriptions: description,
      specialty_id: specialty,
      image_url: imageUrl,
      general_consultation_fee: consultationFee,
      tags,
      is_active: isActive,
      inputted_by: inputtedBy,
    } = rawData;

    const url = await getFileFromS3Bucket(imageUrl);

    const symptom = {
      symptomId,
      name: name.toUpperCase(),
      description,
      specialty,
      imageUrl: url,
      consultationFee,
      tags,
      isActive,
      inputtedBy,
    };

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(symptom),
    });
    return Response.SUCCESS({ data: symptom });
  } catch (error) {
    console.error("GET COMMON SYMPTOMS BY ID ERROR: ", error);
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
      return Response.BAD_REQUEST({ message: "Please upload symptom image" });
    }
    const fileName = `symptom_${generateFileName(file)}`;
    const { buffer, mimetype } = file;

    await Promise.all([
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
    return Response.CREATED({
      message: "Common Symptom Created Successfully",
    });
  } catch (error) {
    console.error("CREATE COMMON SYMPTOMS ERROR: ", error);
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
    await repo.updateCommonSymptomById({
      id,
      name,
      description,
      specialtyId,
      file: fileName,
      consultationFee,
      tags,
    });
    return Response.SUCCESS({
      message: "Common Symptom Updated Succcessfully",
    });
  } catch (error) {
    console.error("UPDATE COMMON SYMPTOMS ERROR: ", error);
    throw error;
  }
};
exports.updateCommonSymptomStatus = async ({ id, status }) => {
  try {
    const symptom = await repo.getCommonSymptomById(id);
    if (!symptom) {
      return Response.NOT_FOUND({ message: "Common Symptom not found" });
    }

    console.log(status);
    return Response.SUCCESS({
      message: "Common Symptom Status Updated Successfully",
    });
  } catch (error) {
    console.error("UPDATE COMMON SYMPTOM STATUS ERROR: ", error);
    throw error;
  }
};
exports.deleteCommonSymptom = async (id) => {
  try {
    const symptom = await repo.getCommonSymptomById(id);
    if (!symptom) {
      return Response.NOT_FOUND({ message: "Common Symptom not found" });
    }

    await repo.deleteCommonSymptomById(id);
    return Response.SUCCESS({ message: "Common Symptom Deleted Successfully" });
  } catch (error) {
    console.error("DELETE COMMON SYMPTOMS ERROR: ", error);
    throw error;
  }
};
