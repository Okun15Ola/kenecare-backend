const logger = require("../../middlewares/logger.middleware");
const {
  getCities,
  getCity,
  createCity,
  updateCity,
  updateCityStatus,
  deleteCity,
} = require("../../services/cities.services");
exports.GetCitiesController = async (req, res, next) => {
  try {
    const response = await getCities();
    response.data = response.data.map(
      ({ cityId, cityName, latitude, longitude }) => {
        return { cityId, cityName, latitude, longitude };
      }
    );
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
exports.GetCityByIDController = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const response = await getCity(id);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
