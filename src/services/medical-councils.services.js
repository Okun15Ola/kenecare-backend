const repo = require("../repository/medical-councils.repository");
const Response = require("../utils/response.utils");
const { redisClient } = require("../config/redis.config");
const { mapMedicalCouncilRow } = require("../utils/db-mapper.utils");
const {
  cacheKeyBulider,
  getCachedCount,
  getPaginationInfo,
} = require("../utils/caching.utils");
const logger = require("../middlewares/logger.middleware");

exports.getMedicalCouncils = async (limit, page) => {
  try {
    const offset = (page - 1) * limit;
    const countCacheKey = "medical-council:count";
    const totalRows = await getCachedCount({
      cacheKey: countCacheKey,
      countQueryFn: repo.countMedicalCouncils,
    });

    if (!totalRows) {
      return Response.SUCCESS({
        message: "No medical councils found",
        data: [],
      });
    }

    const paginationInfo = getPaginationInfo({ totalRows, limit, page });
    const cacheKey = cacheKeyBulider("medical-council:all", limit, offset);
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({
        data: JSON.parse(cachedData),
        pagination: paginationInfo,
      });
    }
    const rawData = await repo.getAllMedicalCouncils(limit, offset);
    if (!rawData?.length) {
      return Response.SUCCESS({
        message: "No medical councils found",
        data: [],
      });
    }

    const councils = rawData.map(mapMedicalCouncilRow);
    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(councils),
      expiry: 3600,
    });
    return Response.SUCCESS({ data: councils, pagination: paginationInfo });
  } catch (error) {
    logger.error("getMedicalCouncils: ", error);
    throw error;
  }
};

exports.getMedicalCouncilByEmail = async (councilEmail) => {
  try {
    const cacheKey = `medical-council:${councilEmail}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }
    const rawData = await repo.getMedicalCouncilById(councilEmail);

    if (!rawData) {
      logger.warn(`Medical Council Not Found for Email ${councilEmail}`);
      return Response.NOT_FOUND({
        message: "Medical Council Not Found ",
      });
    }
    const council = mapMedicalCouncilRow(rawData);
    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(council),
      expiry: 3600,
    });
    return Response.SUCCESS({ data: council });
  } catch (error) {
    logger.error("getMedicalCouncilByEmail: ", error);
    throw error;
  }
};

exports.getMedicalCouncilByMobileNumber = async (number) => {
  try {
    const cacheKey = `medical-council:${number}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }
    const rawData = await repo.getMedicalCouncilByMobileNumber(number);

    if (!rawData) {
      logger.warn(`Medical Council Not Found for Mobile Number ${number}`);
      return Response.NOT_FOUND({
        message: "Medical Council Not Found ",
      });
    }
    const council = mapMedicalCouncilRow(rawData);
    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(council),
      expiry: 3600,
    });
    return Response.SUCCESS({ data: council });
  } catch (error) {
    logger.error("getMedicalCouncilByMobileNumber: ", error);
    throw error;
  }
};

exports.getMedicalCouncil = async (id) => {
  try {
    const cacheKey = `medical-council:${id}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }
    const rawData = await repo.getMedicalCouncilById(id);

    if (!rawData) {
      logger.warn(`Medical Council Not Found for ID ${id}`);
      return Response.NOT_FOUND({ message: "Medical Council Not Found" });
    }
    const council = mapMedicalCouncilRow(rawData);
    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(council),
      expiry: 3600,
    });
    return Response.SUCCESS({ data: council });
  } catch (error) {
    logger.error("getMedicalCouncil: ", error);
    throw error;
  }
};

exports.createMedicalCouncil = async ({
  name,
  email,
  mobileNumber,
  address,
  inputtedBy,
}) => {
  try {
    const { insertId } = await repo.createNewMedicalCouncil({
      name,
      email,
      mobileNumber,
      address,
      inputtedBy,
    });

    if (!insertId) {
      logger.warn("Failed to create medical council");
      return Response.BAD_REQUEST({
        message: "Failed to create medical council",
      });
    }

    await redisClient.clearCacheByPattern("medical-council:*");

    return Response.CREATED({
      message: "Medical council created successfully",
    });
  } catch (error) {
    logger.error("createMedicalCouncil: ", error);
    throw error;
  }
};

exports.updateMedicalCouncil = async ({
  id,
  name,
  email,
  mobileNumber,
  address,
}) => {
  try {
    const rawData = await repo.getMedicalCouncilById(id);

    if (!rawData) {
      logger.warn(`Medical Council Not Found for ID ${id}`);
      return Response.NOT_FOUND({ message: "Medical council not found" });
    }
    const { affectedRows } = await repo.updateMedicalCouncilById({
      id,
      name,
      email,
      mobileNumber,
      address,
    });

    if (!affectedRows || affectedRows < 1) {
      logger.warn(`Failed to update Medical Council for ID ${id}`);
      return Response.NOT_MODIFIED({});
    }

    const cacheKey = `medical-council:${id}`;
    await redisClient.delete(cacheKey);
    await redisClient.clearCacheByPattern("medical-council:*");

    return Response.SUCCESS({
      message: "Medical Council Updated Successfully",
    });
  } catch (error) {
    logger.error("updateMedicalCouncil: ", error);
    throw error;
  }
};

exports.updateMedicalCouncilStatus = async ({ id, status }) => {
  try {
    const rawData = await repo.getMedicalCouncilById(id);

    if (!rawData) {
      logger.warn(`Medical Council Not Found for ID ${id}`);
      return Response.NOT_FOUND({ message: "Medical Council Not Found" });
    }

    if (!Number.isInteger(status) || status < 0 || status > 1) {
      return Response.BAD_REQUEST({ message: "Invalid status" });
    }

    const { affectedRows } = await repo.updateMedicalCouncilStatusById({
      id,
      status,
    });

    if (!affectedRows || affectedRows < 1) {
      logger.warn(`Failed to update Medical Council Status for ID ${id}`);
      return Response.NOT_MODIFIED({});
    }

    const cacheKey = `medical-council:${id}`;
    await redisClient.delete(cacheKey);
    await redisClient.clearCacheByPattern("medical-council:*");

    return Response.SUCCESS({
      message: "Medical Council Status Updated Successfully",
    });
  } catch (error) {
    logger.error("updateMedicalCouncilStatus: ", error);
    throw error;
  }
};

exports.deleteMedicalCouncil = async (id) => {
  try {
    const rawData = await repo.getMedicalCouncilById(id);
    if (!rawData) {
      logger.warn(`Medical Council Not Found for ID ${id}`);
      return Response.NOT_FOUND({ message: "Medical Council Not Found" });
    }

    const { affectedRows } = await repo.deleteMedicalCouncilById(id);

    if (!affectedRows || affectedRows < 1) {
      logger.warn(`Failed to delete Medical Council for ID ${id}`);
      return Response.NOT_MODIFIED({});
    }

    await redisClient.clearCacheByPattern("medical-council:*");

    return Response.SUCCESS({
      message: "Medical Council Deleted Successfully",
    });
  } catch (error) {
    logger.error("deleteMedicalCouncil: ", error);
    throw error;
  }
};
