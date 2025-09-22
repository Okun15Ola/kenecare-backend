const dbObject = require("../../repository/specializations.repository");
const Response = require("../../utils/response.utils");
const { redisClient } = require("../../config/redis.config");
const { mapSpecializationRow } = require("../../utils/db-mapper.utils");
const {
  cacheKeyBulider,
  getPaginationInfo,
} = require("../../utils/caching.utils");
const logger = require("../../middlewares/logger.middleware");

exports.getSpecializations = async (limit, page) => {
  try {
    const offset = (page - 1) * limit;

    const cacheKey = cacheKeyBulider("specializations:all", limit, offset);
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      const { data, pagination } = JSON.parse(cachedData);
      return Response.SUCCESS({
        data,
        pagination,
      });
    }
    const rawData = await dbObject.getAllSpecialization(limit, offset);

    if (!rawData?.length) {
      return Response.SUCCESS({ message: "No specialization found", data: [] });
    }

    const { totalRows } = rawData[0];
    const paginationInfo = getPaginationInfo({ totalRows, limit, page });

    const specializations = rawData.map(mapSpecializationRow);

    const valueToCache = {
      data: specializations,
      pagination: paginationInfo,
    };

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(valueToCache),
      expiry: 3600,
    });

    return Response.SUCCESS({
      data: specializations,
      pagination: paginationInfo,
    });
  } catch (error) {
    logger.error("getSpecializations: ", error);
    throw error;
  }
};

exports.getSpecializationByName = async (name) => {
  try {
    const cacheKey = `specializations:${name}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }
    const rawData = await dbObject.getSpecializationByName(name);

    if (!rawData) {
      logger.warn("Specialization Not Found");
      return Response.NOT_FOUND({ message: "Specialization Not Found" });
    }

    const specialization = mapSpecializationRow(rawData);

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(specialization),
      expiry: 3600,
    });
    return Response.SUCCESS({ data: specialization });
  } catch (error) {
    logger.error("getSpecializationByName: ", error);
    throw error;
  }
};

exports.getSpecializationById = async (id) => {
  try {
    const cacheKey = `specializations:${id}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }
    const rawData = await dbObject.getSpecializationById(id);

    if (!rawData) {
      logger.warn("Specialization Not Found");
      return Response.NOT_FOUND({ message: "Specialization Not Found" });
    }
    const specialization = mapSpecializationRow(rawData);

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(specialization),
      expiry: 3600,
    });
    return Response.SUCCESS({ data: specialization });
  } catch (error) {
    logger.error("getSpecializationById: ", error);
    throw error;
  }
};

exports.createSpecialization = async ({ name, description, imageUrl }) => {
  try {
    const rawData = await dbObject.getSpecializationByName(name);
    if (rawData) {
      logger.warn("Specialization Name already exists");
      return Response.BAD_REQUEST({
        message: "Specialization Name already exists",
      });
    }
    // create new object
    const specialization = {
      name,
      description,
      imageUrl,
      inputtedBy: 1,
    };

    // save to database
    const { insertId } = await dbObject.createNewSpecialization(specialization);

    if (!insertId) {
      logger.warn("Fail to create specialization");
      return Response.NO_CONTENT({});
    }

    await redisClient.clearCacheByPattern("specializations:*");
    return Response.CREATED({ message: "Specialization Created Successfully" });
  } catch (error) {
    logger.error("createSpecialization: ", error);
    throw error;
  }
};

exports.updateSpecialization = async ({ specializationId, specialization }) => {
  try {
    const rawData = await dbObject.getSpecializationById(specializationId);

    if (!rawData) {
      logger.warn("Specialization Not Found");
      return Response.NOT_FOUND({ message: "Specialization Not Found" });
    }
    const { affectedRows } = await dbObject.updateSpecializationById({
      id: specializationId,
      specialization,
    });

    if (!affectedRows || affectedRows < 1) {
      logger.error("No rows affected during update for ID:", specializationId);
      return Response.NOT_MODIFIED({});
    }

    await redisClient.clearCacheByPattern("specializations:*");
    return Response.SUCCESS({ message: "Specialization Updated Successfully" });
  } catch (error) {
    logger.error("updateSpecialization: ", error);
    throw error;
  }
};

exports.updateSpecializationStatus = async ({ specializationId, status }) => {
  try {
    const rawData = await dbObject.getSpecializationById(specializationId);

    if (!rawData) {
      logger.warn("Specialization Not Found");
      return Response.NOT_FOUND({ message: "Specialization Not Found" });
    }

    if (!Number.isInteger(status) || status < 0 || status > 1) {
      return Response.BAD_REQUEST({ message: "Invalid Status Code" });
    }

    const { affectedRows } = await dbObject.updateSpecializationStatusById({
      specializationId,
      status,
    });

    if (!affectedRows || affectedRows < 1) {
      logger.error("No rows affected during update for ID:", specializationId);
      return Response.NOT_MODIFIED({});
    }

    await redisClient.clearCacheByPattern("specializations:*");
    return Response.SUCCESS({
      message: "Specialization Status Updated Successfully",
    });
  } catch (error) {
    logger.error("updateSpecializationStatus: ", error);
    throw error;
  }
};

exports.deleteSpecialization = async (specializationId) => {
  try {
    const rawData = await dbObject.getSpecializationById(specializationId);

    if (!rawData) {
      logger.warn("Specialization Not Found");
      return Response.NOT_FOUND({ message: "Specialization Not Found" });
    }

    const { affectedRows } =
      await dbObject.deleteSpecializationById(specializationId);

    if (!affectedRows || affectedRows < 1) {
      logger.error(
        "No rows affected during deletion for ID:",
        specializationId,
      );
      return Response.NOT_MODIFIED({});
    }

    await redisClient.clearCacheByPattern("specializations:*");
    return Response.SUCCESS({ message: "Specialization Deleted Successfully" });
  } catch (error) {
    logger.error("deleteSpecialization: ", error);
    throw error;
  }
};
