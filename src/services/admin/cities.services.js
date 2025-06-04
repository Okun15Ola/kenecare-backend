const dbObject = require("../../repository/cities.repository");
const Response = require("../../utils/response.utils");
const redisClient = require("../../config/redis.config");

exports.getCities = async () => {
  try {
    const cacheKey = "cities:all";
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }
    const rawData = await dbObject.getAllCities();
    const cities = rawData.map(
      ({
        city_id: cityId,
        city_name: cityName,
        latitude,
        longitude,
        is_active: isActive,
        inputted_by: inputtedBy,
      }) => ({
        cityId,
        cityName,
        latitude,
        longitude,
        isActive,
        inputtedBy,
      }),
    );

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(cities),
    });
    return Response.SUCCESS({ data: cities });
  } catch (error) {
    console.error(error);
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
    const rawData = await dbObject.getCityById(id);
    if (!rawData) {
      return Response.NOT_FOUND({ message: "City Not Found" });
    }
    const {
      city_id: cityId,
      city_name: cityName,
      latitude,
      longitude,
      is_active: isActive,
      inputted_by: inputtedBy,
    } = rawData;

    const city = {
      cityId,
      cityName,
      latitude,
      longitude,
      isActive,
      inputtedBy,
    };

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(city),
    });
    return Response.SUCCESS({ data: city });
  } catch (error) {
    console.error(error);
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
      return Response.NOT_FOUND({ message: "City Not Found" });
    }
    const {
      city_id: cityId,
      city_name: cityName,
      latitude,
      longitude,
      is_active: isActive,
      inputted_by: inputtedBy,
    } = rawData;

    const city = {
      cityId,
      cityName,
      latitude,
      longitude,
      isActive,
      inputtedBy,
    };

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(city),
    });
    return Response.SUCCESS({ data: city });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
exports.createCity = async ({ name, latitude, longitude, inputtedBy }) => {
  try {
    await dbObject.createNewCity({
      name,
      latitude,
      longitude,
      inputtedBy,
    });

    return Response.CREATED({ message: "City Created Successfully" });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
exports.updateCity = async ({ id, name, latitude, longitude }) => {
  try {
    const rawData = await dbObject.getCityById(id);
    if (!rawData) {
      return Response.NOT_FOUND({ message: "City Not Found" });
    }
    await dbObject.updateCityById({
      id,
      name,
      latitude,
      longitude,
    });
    return Response.SUCCESS({ message: "City Updated Succcessfully" });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
exports.updateCityStatus = async ({ id, status }) => {
  try {
    const rawData = await dbObject.getCityById(id);
    if (!rawData) {
      return Response.NOT_FOUND({ message: "City Not Found" });
    }
    await dbObject.updateCityStatusById({ id, status });
    return Response.SUCCESS({ message: "City Status Updated Successfully" });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
exports.deleteCity = async (id) => {
  try {
    const rawData = await dbObject.getCityById(id);
    if (!rawData) {
      return Response.NOT_FOUND({ message: "City Not Found" });
    }
    await dbObject.deleteCityById(id);
    return Response.SUCCESS({ message: "City Deleted Successfully" });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
