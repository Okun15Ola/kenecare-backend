const fs = require("fs");
const path = require("path");
const repo = require("../repository/specialities.repository");
const Response = require("../utils/response.utils");
const { deleteFile } = require("../utils/file-upload.utils");
const redisClient = require("../config/redis.config");
const { cacheKeyBulider } = require("../utils/caching.utils");
const { mapSpecialityRow } = require("../utils/db-mapper.utils");

/**
 * @description Service to handle specialties related operations
 * @module services/specialties.services
 */

exports.getSpecialties = async (limit, offset, paginationInfo) => {
  try {
    const cacheKey = cacheKeyBulider("specialties:all", limit, offset);
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData), paginationInfo });
    }
    const rawData = await repo.getAllSpecialties(limit, offset);
    const specialties = rawData.map(mapSpecialityRow);
    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(specialties),
    });
    return Response.SUCCESS({ data: specialties, pagination: paginationInfo });
  } catch (error) {
    console.error("GET ALL SPECIALTIES ERROR: ", error);
    throw error;
  }
};

exports.getSpecialtyByName = async (name) => {
  try {
    const cacheKey = `specialties:${name}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }
    const rawData = await repo.getSpecialtyByName(name);

    if (!rawData) {
      return Response.NOT_FOUND({ message: "Specialty Not Found" });
    }

    const specialty = mapSpecialityRow(rawData);
    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(specialty),
    });
    return Response.SUCCESS({ data: specialty });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.getSpecialtyById = async (id) => {
  try {
    const cacheKey = `specialties:${id}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }
    const rawData = await repo.getSpecialtiyById(id);

    if (!rawData) {
      return Response.NOT_FOUND({ message: "Specialty Not Found" });
    }

    const specialty = mapSpecialityRow(rawData, true);
    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(specialty),
    });
    return Response.SUCCESS({ data: specialty });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.createSpecialty = async ({ name, description, image, inputtedBy }) => {
  try {
    // save to database
    await repo.createNewSpecialty({
      name,
      description,
      image,
      inputtedBy,
    });

    return Response.CREATED({ message: "Specialty Created Successfully" });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.updateSpecialty = async ({ id, name, image, description }) => {
  try {
    const rawData = await repo.getSpecialtiyById(id);
    if (!rawData) return null;

    const { image_url: imageUrl } = rawData;

    if (imageUrl) {
      const file = path.join(__dirname, "../public/upload/media/", imageUrl);
      await deleteFile(file);
    }
    await repo.updateSpecialtiyById({
      id,
      name,
      image,
      description,
    });

    return Response.SUCCESS({ message: "Specialty Updated Successfully" });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
exports.updateSpecialtyStatus = async ({ id, status }) => {
  try {
    if (!Number.isInteger(status) || status < 0 || status > 1) {
      return Response.BAD_REQUEST({ message: "Invalid Status Code" });
    }

    await repo.updateSpecialtiyStatusById({
      id,
      status,
    });

    return Response.SUCCESS({
      message: "Specialty Status Updated Successfully",
    });
  } catch (error) {
    console.error("Error updating specialty status: ", error);
    throw error;
  }
};

exports.deleteSpecialty = async (id) => {
  try {
    const { image_url: imageUrl } = await repo.getSpecialtiyById(id);
    if (imageUrl) {
      const file = path.join(__dirname, "../public/upload/media/", imageUrl);
      fs.unlinkSync(file);
    }

    await repo.deleteSpecialtieById(id);

    return Response.SUCCESS({ message: "Specialty Deleted Successfully" });
  } catch (error) {
    console.error("Error deleting specialty: ", error);
    throw error;
  }
};
