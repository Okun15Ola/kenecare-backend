const repo = require("../repository/specialities.repository");
const Response = require("../utils/response.utils");
const {
  uploadFileToS3Bucket,
  deleteFileFromS3Bucket,
} = require("../utils/aws-s3.utils");
const { generateFileName } = require("../utils/file-upload.utils");
const { redisClient } = require("../config/redis.config");
const {
  cacheKeyBulider,
  getPaginationInfo,
} = require("../utils/caching.utils");
const { mapSpecialityRow } = require("../utils/db-mapper.utils");
const logger = require("../middlewares/logger.middleware");

exports.getSpecialties = async (limit, page) => {
  try {
    const offset = (page - 1) * limit;
    const cacheKey = cacheKeyBulider("specialties:all", limit, offset);

    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      const { data, pagination } = JSON.parse(cachedData);
      return Response.SUCCESS({ data, pagination });
    }

    const rawData = await repo.getAllSpecialties(limit, offset);
    if (!rawData?.length) {
      return Response.SUCCESS({ message: "No specialties found", data: [] });
    }

    const { totalRows } = rawData[0];

    const paginationInfo = getPaginationInfo({ totalRows, limit, page });

    const specialties = await Promise.all(rawData.map(mapSpecialityRow));

    const valueToCache = {
      data: specialties,
      pagination: paginationInfo,
    };

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(valueToCache),
      expiry: 3600,
    });
    return Response.SUCCESS({ data: specialties, pagination: paginationInfo });
  } catch (error) {
    logger.error("getSpecialties: ", error);
    throw error;
  }
};

exports.getSpecialtyByName = async (name) => {
  try {
    const cacheKey = `specialty:${name}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }
    const rawData = await repo.getSpecialtyByName(name);

    if (!rawData) {
      return Response.NOT_FOUND({ message: "Specialty Not Found" });
    }

    const specialty = await mapSpecialityRow(rawData);
    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(specialty),
      expiry: 3600,
    });
    return Response.SUCCESS({ data: specialty });
  } catch (error) {
    logger.error("getSpecialtyByName: ", error);
    throw error;
  }
};

exports.getSpecialtyById = async (id) => {
  try {
    const cacheKey = `specialty:${id}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }
    const rawData = await repo.getSpecialtiyById(id);

    if (!rawData) {
      return Response.NOT_FOUND({ message: "Specialty Not Found" });
    }

    const specialty = await mapSpecialityRow(rawData, true);
    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(specialty),
      expiry: 3600,
    });
    return Response.SUCCESS({ data: specialty });
  } catch (error) {
    logger.error("getSpecialtyById: ", error);
    throw error;
  }
};

exports.createSpecialty = async ({ name, description, image, inputtedBy }) => {
  try {
    let fileName = null;
    if (image) {
      const { buffer, mimetype } = image;
      fileName = `specialty_${generateFileName(image)}`;
      await uploadFileToS3Bucket({
        fileName,
        buffer,
        mimetype,
      });
    }

    const { insertId } = await repo.createNewSpecialty({
      name,
      description,
      image: fileName,
      inputtedBy,
    });

    if (!insertId) {
      return Response.BAD_REQUEST({ message: "Failed to create specialty" });
    }

    await redisClient.clearCacheByPattern("specialties:*");
    await redisClient.clearCacheByPattern("specialty:*");

    return Response.CREATED({ message: "Specialty Created Successfully" });
  } catch (error) {
    logger.error("createSpecialty: ", error);
    throw error;
  }
};

exports.updateSpecialty = async ({ id, name, image, description }) => {
  try {
    const rawData = await repo.getSpecialtiyById(id);
    if (!rawData) {
      return Response.NOT_FOUND({ message: "Specialty Not Found" });
    }

    const { image_url: imageUrl } = rawData;

    let fileName = null;
    if (image) {
      const { buffer, mimetype } = image;
      fileName = imageUrl || `specialty_${generateFileName(image)}`;
      await uploadFileToS3Bucket({
        fileName,
        buffer,
        mimetype,
      });
    }

    const { affectedRows } = await repo.updateSpecialtiyById({
      id,
      name,
      image: fileName,
      description,
    });

    if (!affectedRows || affectedRows < 1) {
      return Response.NOT_MODIFIED({});
    }

    const cacheKey = `specialty:${id}`;
    await redisClient.delete(cacheKey);

    return Response.SUCCESS({ message: "Specialty Updated Successfully" });
  } catch (error) {
    logger.error("updateSpecialty: ", error);
    throw error;
  }
};

exports.updateSpecialtyStatus = async ({ id, status }) => {
  try {
    if (!Number.isInteger(status) || status < 0 || status > 1) {
      return Response.BAD_REQUEST({ message: "Invalid Status Code" });
    }

    const { affectedRows } = await repo.updateSpecialtiyStatusById({
      id,
      status,
    });

    if (!affectedRows || affectedRows < 1) {
      return Response.NOT_MODIFIED({});
    }

    const cacheKey = `specialty:${id}`;
    await redisClient.delete(cacheKey);

    return Response.SUCCESS({
      message: "Specialty Status Updated Successfully",
    });
  } catch (error) {
    logger.error("updateSpecialtyStatus: ", error);
    throw error;
  }
};

exports.deleteSpecialty = async (id) => {
  try {
    const { image_url: imageUrl } = await repo.getSpecialtiyById(id);
    if (imageUrl) {
      await deleteFileFromS3Bucket(imageUrl);
    }

    const { affectedRows } = await repo.deleteSpecialtieById(id);

    if (!affectedRows || affectedRows < 1) {
      return Response.NOT_MODIFIED({});
    }

    const cacheKey = `specialty:${id}`;
    await redisClient.delete(cacheKey);
    await redisClient.clearCacheByPattern("specialties:*");

    return Response.SUCCESS({ message: "Specialty Deleted Successfully" });
  } catch (error) {
    logger.error("deleteSpecialty: ", error);
    throw error;
  }
};
