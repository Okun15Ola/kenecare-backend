const dbObject = require("../../repository/cities.repository");
const Response = require("../../utils/response.utils");
const { redisClient } = require("../../config/redis.config");
const { mapCityRow } = require("../../utils/db-mapper.utils");
const {
  cacheKeyBulider,
  getCachedCount,
  getPaginationInfo,
} = require("../../utils/caching.utils");
const logger = require("../../middlewares/logger.middleware");

exports.getCities = async (limit, page) => {
  try {
    const offset = (page - 1) * limit;
    const countCacheKey = "cities:count";
    const totalRows = await getCachedCount({
      cacheKey: countCacheKey,
      countQueryFn: dbObject.countCity,
    });

    if (!totalRows) {
      return Response.SUCCESS({ message: "No cities found", data: [] });
    }

    const paginationInfo = getPaginationInfo({ totalRows, limit, page });
    const cacheKey = cacheKeyBulider("cities:all", limit, offset);
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({
        data: JSON.parse(cachedData),
        pagination: paginationInfo,
      });
    }
    const [rawData] = await dbObject.getAllCities(limit, offset);
    if (!rawData?.length) {
      return Response.SUCCESS({ message: "No cities found", data: [] });
    }

    const cities = rawData.map(mapCityRow);

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(cities),
      expiry: 3600,
    });
    return Response.SUCCESS({ data: cities, pagination: paginationInfo });
  } catch (error) {
    logger.error("getCities: ", error);
    throw error;
  }
};

exports.getCity = async (id) => {
  try {
    const cacheKey = `cities:${id}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }
    const [rawData] = await dbObject.getCityById(id);
    if (!rawData) {
      logger.warn(`City Not Found for ID ${id}`);
      return Response.NOT_FOUND({ message: "City Not Found" });
    }
    const city = mapCityRow(rawData);

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(city),
      expiry: 3600,
    });
    return Response.SUCCESS({ data: city });
  } catch (error) {
    logger.error("getCity: ", error);
    throw error;
  }
};

exports.getCityByName = async (name) => {
  try {
    const cacheKey = `cities:${name}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }
    const rawData = await dbObject.getCityByName(name);
    if (!rawData) {
      logger.warn(`City Not Found for Name ${name}`);
      return Response.NOT_FOUND({ message: "City Not Found" });
    }
    const city = mapCityRow(rawData);

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(city),
      expiry: 3600,
    });
    return Response.SUCCESS({ data: city });
  } catch (error) {
    logger.error("getCityByName: ", error);
    throw error;
  }
};

exports.createCity = async ({ name, latitude, longitude, inputtedBy }) => {
  try {
    const { insertId } = await dbObject.createNewCity({
      name,
      latitude,
      longitude,
      inputtedBy,
    });

    if (!insertId) {
      logger.warn("Failed to create city");
      return Response.NOT_MODIFIED({ message: "City Not Created" });
    }

    // clear cache
    await redisClient.clearCacheByPattern("cities:*");

    return Response.CREATED({ message: "City Created Successfully" });
  } catch (error) {
    logger.error("createCity: ", error);
    throw error;
  }
};

exports.updateCity = async ({ id, name, latitude, longitude }) => {
  try {
    const rawData = await dbObject.getCityById(id);
    if (!rawData) {
      logger.warn(`City Not Found for ID ${id}`);
      return Response.NOT_FOUND({ message: "City Not Found" });
    }
    const { affectedRows } = await dbObject.updateCityById({
      id,
      name,
      latitude,
      longitude,
    });

    if (!affectedRows || affectedRows < 1) {
      logger.warn("Failed to update city");
      return Response.NOT_MODIFIED({});
    }
    await redisClient.clearCacheByPattern("cities:*");

    return Response.SUCCESS({ message: "City Updated Succcessfully" });
  } catch (error) {
    logger.error("updateCity: ", error);
    throw error;
  }
};

exports.updateCityStatus = async ({ id, status }) => {
  try {
    const rawData = await dbObject.getCityById(id);
    if (!rawData) {
      logger.warn(`City Not Found for ID ${id}`);
      return Response.NOT_FOUND({ message: "City Not Found" });
    }
    const { affectedRows } = await dbObject.updateCityStatusById({
      id,
      status,
    });

    if (!affectedRows || affectedRows < 1) {
      logger.warn(`Failed to update city status for ID ${id}`);
      return Response.NOT_MODIFIED({});
    }

    // clear cache
    await redisClient.clearCacheByPattern("cities:*");
    return Response.SUCCESS({ message: "City Status Updated Successfully" });
  } catch (error) {
    logger.error("updateCityStatus: ", error);
    throw error;
  }
};

exports.deleteCity = async (id) => {
  try {
    const rawData = await dbObject.getCityById(id);
    if (!rawData) {
      logger.warn(`City Not Found for ID ${id}`);
      return Response.NOT_FOUND({ message: "City Not Found" });
    }
    const { affectedRows } = await dbObject.deleteCityById(id);

    if (!affectedRows || affectedRows < 1) {
      logger.warn(`Failed to delete city for ID ${id}`);
      return Response.NOT_MODIFIED({});
    }
    // clear cache
    await redisClient.clearCacheByPattern("cities:*");
    return Response.SUCCESS({ message: "City Deleted Successfully" });
  } catch (error) {
    logger.error("deleteCity: ", error);
    throw error;
  }
};
