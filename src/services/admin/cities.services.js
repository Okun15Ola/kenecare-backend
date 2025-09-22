const dbObject = require("../../repository/cities.repository");
const Response = require("../../utils/response.utils");
const { mapCityRow } = require("../../utils/db-mapper.utils");
const { getPaginationInfo } = require("../../utils/caching.utils");
const logger = require("../../middlewares/logger.middleware");

exports.getCities = async (limit, page) => {
  try {
    const offset = (page - 1) * limit;
    const { totalRows } = await dbObject.countCity();

    if (!totalRows) {
      return Response.SUCCESS({ message: "No cities found", data: [] });
    }

    const paginationInfo = getPaginationInfo({ totalRows, limit, page });
    const [rawData] = await dbObject.getAllCities(limit, offset);
    if (!rawData?.length) {
      return Response.SUCCESS({ message: "No cities found", data: [] });
    }

    const cities = rawData.map(mapCityRow);

    return Response.SUCCESS({ data: cities, pagination: paginationInfo });
  } catch (error) {
    logger.error("getCities: ", error);
    throw error;
  }
};

exports.getCity = async (id) => {
  try {
    const [rawData] = await dbObject.getCityById(id);
    if (!rawData) {
      return Response.NOT_FOUND({ message: "City Not Found" });
    }
    const city = mapCityRow(rawData);

    return Response.SUCCESS({ data: city });
  } catch (error) {
    logger.error("getCity: ", error);
    throw error;
  }
};

exports.getCityByName = async (name) => {
  try {
    const rawData = await dbObject.getCityByName(name);
    if (!rawData) {
      return Response.NOT_FOUND({ message: "City Not Found" });
    }
    const city = mapCityRow(rawData);

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
      return Response.INTERNAL_SERVER_ERROR({
        message: "An error occured while creating city.",
      });
    }

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
      return Response.NOT_FOUND({ message: "City Not Found" });
    }
    const { affectedRows } = await dbObject.updateCityById({
      id,
      name,
      latitude,
      longitude,
    });

    if (!affectedRows || affectedRows < 1) {
      return Response.NOT_MODIFIED({});
    }

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
      return Response.NOT_FOUND({ message: "City Not Found" });
    }
    const { affectedRows } = await dbObject.updateCityStatusById({
      id,
      status,
    });

    if (!affectedRows || affectedRows < 1) {
      return Response.NOT_MODIFIED({});
    }

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
      return Response.NOT_FOUND({ message: "City Not Found" });
    }
    const { affectedRows } = await dbObject.deleteCityById(id);

    if (!affectedRows || affectedRows < 1) {
      return Response.NOT_MODIFIED({});
    }

    return Response.SUCCESS({ message: "City Deleted Successfully" });
  } catch (error) {
    logger.error("deleteCity: ", error);
    throw error;
  }
};
