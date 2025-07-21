const logger = require("../../middlewares/logger.middleware");
const service = require("../../services/index.services");

exports.GetBlogsController = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const response = await service.getBlogsIndexService(limit, page);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error("GetBlogsController: ", error);
    return next(error);
  }
};
exports.GetBlogByIDController = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const response = await service.getBlogIndexService(id);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error("GetBlogByIDController: ", error);
    return next(error);
  }
};
exports.GetBlogCategoriesController = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const response = await service.getBlogCategoriesIndexService(limit, page);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error("GetBlogCategoriesController: ", error);
    return next(error);
  }
};
exports.GetBlogCategoryByIDController = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const response = await service.getBlogCategoryIndexService(id);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error("GetBlogCategoryByIDController: ", error);
    return next(error);
  }
};
exports.GetCitiesController = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const response = await service.getCitiesIndexService(limit, page);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error("GetCitiesController: ", error);
    return next(error);
  }
};
exports.GetCityByIDController = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const response = await service.getCityIndexService(id);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error("GetCityByIDController", error);
    return next(error);
  }
};
exports.GetCommonSymptomsController = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const response = await service.getCommonSymptomsIndexService(limit, page);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error("GetCommonSymptomsController: ", error);
    return next(error);
  }
};
exports.GetCommonSymptomByIDController = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const response = await service.getCommonSymptomIndexService(id);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error("GetCommonSymptomByIDController: ", error);
    return next(error);
  }
};
exports.GetDoctorsController = async (req, res, next) => {
  try {
    const {
      locationId,
      q: query,
      specialty_id: specialtyId,
      page,
      limit,
    } = req.query;

    let response;

    if (specialtyId) {
      response = await service.getDoctorBySpecialtyIdIndexService(
        specialtyId,
        limit,
        page,
      );
    } else if (locationId || query) {
      response = await service.getDoctorByQueryIndexService(
        locationId,
        query,
        limit,
        page,
      );
    } else {
      response = await service.getAllDoctorIndexService(limit, page);
    }

    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error("GetDoctorsController: ", error);
    return next(error);
  }
};
exports.GetDoctorByIDController = async (req, res, next) => {
  try {
    const doctorId = parseInt(req.params.id, 10);
    const response = await service.getDoctorByIdIndexService(doctorId);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error("GetDoctorByIDController: ", error);
    return next(error);
  }
};
exports.GetFaqsController = async (req, res, next) => {
  try {
    return res.sendStatus(200);
  } catch (error) {
    logger.error("GetFaqsController: ", error);
    return next(error);
  }
};
exports.GetFaqByIdController = async (req, res, next) => {
  try {
    return res.sendStatus(200);
  } catch (error) {
    logger.error("GetFaqByIdController: ", error);
    return next(error);
  }
};
exports.GetMedicalCouncilsController = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const response = await service.getMedicalCouncilsIndexService(limit, page);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error("GetMedicalCouncilsController: ", error);
    return next(error);
  }
};
exports.GetMedicalCouncilByIDController = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const response = await service.getMedicalCouncilIndexService(id);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error("GetMedicalCouncilByIDController: ", error);
    return next(error);
  }
};
exports.GetMedicalDegreesController = async (req, res, next) => {
  try {
    return res.sendStatus(200);
  } catch (error) {
    logger.error("GetMedicalDegreesController: ", error);
    return next(error);
  }
};
exports.GetMedicalDegreeByIDController = async (req, res, next) => {
  try {
    return res.sendStatus(200);
  } catch (error) {
    logger.error("GetMedicalDegreeByIDController: ", error);
    return next(error);
  }
};
exports.GetSectionOneController = async (req, res, next) => {
  try {
    return res.sendStatus(200);
  } catch (error) {
    logger.error("GetSectionOneController: ", error);
    return next(error);
  }
};
exports.GetServicesController = async (req, res, next) => {
  try {
    return res.sendStatus(200);
  } catch (error) {
    logger.error("GetServicesController: ", error);
    return next(error);
  }
};
exports.GetServiceByIDController = async (req, res, next) => {
  try {
    return res.sendStatus(200);
  } catch (error) {
    logger.error("GetServiceByIDController: ", error);
    return next(error);
  }
};
exports.GetSpecializationsController = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const response = await service.getSpecializationsIndexService(limit, page);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error("GetSpecializationsController: ", error);
    return next(error);
  }
};
exports.GetSpecializationByIDController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const response = await service.getSpecializationByIdIndexService(id);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error("GetSpecializationByIDController: ", error);
    return next(error);
  }
};
exports.GetSpecialtiesController = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const response = await service.getSpecialtiesIndexService(limit, page);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error("GetSpecialtiesController: ", error);
    return next(error);
  }
};
exports.GetSpecialtyByIDController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const response = await service.getSpecialtyByIdIndexService(id);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error("GetSpecialtyByIDController: ", error);
    return next(error);
  }
};
exports.GetUserTypesController = async (req, res, next) => {
  try {
    return res.sendStatus(200);
  } catch (error) {
    logger.error("GetUserTypesController: ", error);
    return next(error);
  }
};
exports.GetUserTypeByIDController = async (req, res, next) => {
  try {
    return res.sendStatus(200);
  } catch (error) {
    logger.error("GetUserTypeByIDController: ", error);
    return next(error);
  }
};
exports.GetTestimonialsController = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const response = await service.getTestimonialsIndexService(limit, page);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error("GetTestimonialsController: ", error);
    return next(error);
  }
};
exports.GetTestimonialByIDController = async (req, res, next) => {
  try {
    return res.sendStatus(200);
  } catch (error) {
    logger.error("GetTestimonialByIDController: ", error);
    return next(error);
  }
};
