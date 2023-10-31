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
exports.CreateCityController = async (req, res, next) => {
  try {
    const inputtedBy = 1;
    const { name, latitude, longitude } = req.body;

    const response = await createCity({
      name,
      latitude,
      longitude,
      inputtedBy,
    });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};

exports.UpdateCityByIdController = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { name, latitude, longitude } = req.body;

    const response = await updateCity({
      id,
      name,
      latitude,
      longitude,
    });

    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
exports.UpdateCityStatusController = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const status = parseInt(req.query.status);

    const response = await updateCityStatus({ id, status });

    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};

exports.DeleteCityByIdController = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    const response = await deleteCity(id);

    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
