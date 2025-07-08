const repo = require("../repository/medical-councils.repository");
const Response = require("../utils/response.utils");
const { redisClient } = require("../config/redis.config");
const { mapMedicalCouncilRow } = require("../utils/db-mapper.utils");
const { cacheKeyBulider } = require("../utils/caching.utils");

exports.getMedicalCouncils = async (limit, offset, paginationInfo) => {
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
    return Response.NOT_FOUND({
      message: "Medical Council Not Found ",
    });
  }

  const councils = rawData.map(mapMedicalCouncilRow);
  await redisClient.set({
    key: cacheKey,
    value: JSON.stringify(councils),
  });
  return Response.SUCCESS({ data: councils, pagination: paginationInfo });
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
      return Response.NOT_FOUND({
        message: "Medical Council Not Found ",
      });
    }
    const council = mapMedicalCouncilRow(rawData);
    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(council),
    });
    return Response.SUCCESS({ data: council });
  } catch (error) {
    console.error(error);
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
      return Response.NOT_FOUND({
        message: "Medical Council Not Found ",
      });
    }
    const council = mapMedicalCouncilRow(rawData);
    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(council),
    });
    return Response.SUCCESS({ data: council });
  } catch (error) {
    console.error(error);
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
      return Response.NOT_FOUND({ message: "Medical Council Not Found" });
    }
    const council = mapMedicalCouncilRow(rawData);
    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(council),
    });
    return Response.SUCCESS({ data: council });
  } catch (error) {
    console.error(error);
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
    await repo.createNewMedicalCouncil({
      name,
      email,
      mobileNumber,
      address,
      inputtedBy,
    });

    return Response.CREATED({
      message: "Medical Council Created Successfully",
    });
  } catch (error) {
    console.error(error);
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
      return Response.NOT_FOUND({ message: "Medical Council Not Found" });
    }
    await repo.updateMedicalCouncilById({
      id,
      name,
      email,
      mobileNumber,
      address,
    });

    return Response.SUCCESS({
      message: "Medical Council Updated Successfully",
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
exports.updateMedicalCouncilStatus = async ({ id, status }) => {
  try {
    const rawData = await repo.getMedicalCouncilById(id);

    if (!rawData) {
      return Response.NOT_FOUND({ message: "Medical Council Not Found" });
    }

    if (!Number.isInteger(status) || status < 0 || status > 1) {
      return Response.BAD_REQUEST({ message: "Invalid Status Code" });
    }

    await repo.updateMedicalCouncilStatusById({
      id,
      status,
    });

    return Response.SUCCESS({
      message: "Medical Council Status Updated Successfully",
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.deleteMedicalCouncil = async (id) => {
  try {
    const rawData = await repo.getMedicalCouncilById(id);
    if (!rawData) {
      return Response.NOT_FOUND({ message: "Medical Council Not Found" });
    }

    await repo.deleteMedicalCouncilById(id);

    return Response.SUCCESS({
      message: "Medical Council Deleted Successfully",
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
