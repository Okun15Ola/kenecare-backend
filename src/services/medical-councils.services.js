const dbObject = require("../db/db.medical-councils");
const Response = require("../utils/response.utils");
const redisClient = require("../config/redis.config");

exports.getMedicalCouncils = async () => {
  const cacheKey = "medical-council:all";
  const cachedData = await redisClient.get(cacheKey);
  if (cachedData) {
    return Response.SUCCESS({ data: JSON.parse(cachedData) });
  }
  const rawData = await dbObject.getAllMedicalCouncils();

  const councils = rawData.map(
    ({
      council_id: councilId,
      council_name: councilName,
      email,
      address,
      mobile_number: mobileNumber,
      is_active: isActive,
      inputted_by: inputtedBy,
    }) => ({
      councilId,
      councilName,
      email,
      address,
      mobileNumber,
      isActive,
      inputtedBy,
    }),
  );
  await redisClient.set({
    key: cacheKey,
    value: JSON.stringify(councils),
  });
  return Response.SUCCESS({ data: councils });
};

exports.getMedicalCouncilByEmail = async (councilEmail) => {
  try {
    const cacheKey = `medical-council:${councilEmail}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }
    const rawData = await dbObject.getMedicalCouncilById(councilEmail);

    if (!rawData) {
      return Response.NOT_FOUND({
        message: "Medical Council Not Found ",
      });
    }
    const {
      council_id: councilId,
      council_name: councilName,
      email,
      address,
      mobile_number: mobileNumber,
      is_active: isActive,
      inputted_by: inputtedBy,
    } = rawData;

    const council = {
      councilId,
      councilName,
      email,
      address,
      mobileNumber,
      isActive,
      inputtedBy,
    };
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
    const rawData = await dbObject.getMedicalCouncilByMobileNumber(number);

    if (!rawData) {
      return Response.NOT_FOUND({
        message: "Medical Council Not Found ",
      });
    }
    const {
      council_id: councilId,
      council_name: councilName,
      email,
      mobile_number: mobileNumber,
      address,
      is_active: isActive,
      inputted_by: inputtedBy,
    } = rawData;

    const council = {
      councilId,
      councilName,
      email,
      address,
      mobileNumber,
      isActive,
      inputtedBy,
    };
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
    const rawData = await dbObject.getMedicalCouncilById(id);

    if (!rawData) {
      return Response.NOT_FOUND({ message: "Medical Council Not Found" });
    }
    const {
      council_id: councilId,
      council_name: councilName,
      email,
      address,
      mobile_number: mobileNumber,
      is_active: isActive,
      inputted_by: inputtedBy,
    } = rawData;

    const council = {
      councilId,
      councilName,
      email,
      address,
      mobileNumber,
      isActive,
      inputtedBy,
    };
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
    await dbObject.createNewMedicalCouncil({
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
    const rawData = await dbObject.getMedicalCouncilById(id);

    if (!rawData) {
      return Response.NOT_FOUND({ message: "Medical Council Not Found" });
    }
    await dbObject.updateMedicalCouncilById({
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
    const rawData = await dbObject.getMedicalCouncilById(id);

    if (!rawData) {
      return Response.NOT_FOUND({ message: "Medical Council Not Found" });
    }

    if (!Number.isInteger(status) || status < 0 || status > 1) {
      return Response.BAD_REQUEST({ message: "Invalid Status Code" });
    }

    await dbObject.updateMedicalCouncilStatusById({
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
    const rawData = await dbObject.getMedicalCouncilById(id);
    if (!rawData) {
      return Response.NOT_FOUND({ message: "Medical Council Not Found" });
    }

    await dbObject.deleteMedicalCouncilById(id);

    return Response.SUCCESS({
      message: "Medical Council Deleted Successfully",
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
