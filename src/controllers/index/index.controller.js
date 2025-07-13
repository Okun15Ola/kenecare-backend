const logger = require("../../middlewares/logger.middleware");
const {
  getBlogCategories,
  getBlogCategory,
} = require("../../services/admin/blog-categories.services");
const { getBlogs, getBlog } = require("../../services/admin/blogs.services");
const { getCities, getCity } = require("../../services/admin/cities.services");
const {
  getCommonSymptoms,
  getCommonSymptom,
} = require("../../services/common-symptoms.services");
const {
  getAllDoctors,
  getDoctorById,
  getDoctorBySpecialtyId,
  getDoctorByQuery,
} = require("../../services/doctors/doctors.services");

const {
  getMedicalCouncils,
  getMedicalCouncil,
} = require("../../services/medical-councils.services");
const {
  getSpecializations,
  getSpecializationById,
} = require("../../services/admin/specializations.services");
const {
  getSpecialties,
  getSpecialtyById,
} = require("../../services/specialties.services");
const { getTestimonials } = require("../../services/testimonials.services");

exports.GetBlogsController = async (req, res, next) => {
  try {
    const {
      pagination: { limit, offset },
      paginationInfo,
    } = req;

    const response = await getBlogs(limit, offset, paginationInfo);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error("GetBlogsController: ", error);
    return next(error);
  }
};
exports.GetBlogByIDController = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const response = await getBlog(id);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error("GetBlogByIDController: ", error);
    return next(error);
  }
};
exports.GetBlogCategoriesController = async (req, res, next) => {
  try {
    const {
      pagination: { limit, offset },
      paginationInfo,
    } = req;
    const response = await getBlogCategories(limit, offset, paginationInfo);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error("GetBlogCategoriesController: ", error);
    return next(error);
  }
};
exports.GetBlogCategoryByIDController = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const response = await getBlogCategory(id);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error("GetBlogCategoryByIDController: ", error);
    return next(error);
  }
};
exports.GetCitiesController = async (req, res, next) => {
  try {
    const {
      pagination: { limit, offset },
      paginationInfo,
    } = req;
    const response = await getCities(limit, offset, paginationInfo);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error("GetCitiesController: ", error);
    return next(error);
  }
};
exports.GetCityByIDController = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const response = await getCity(id);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error("GetCityByIDController", error);
    return next(error);
  }
};
exports.GetCommonSymptomsController = async (req, res, next) => {
  try {
    const {
      pagination: { limit, offset },
      paginationInfo,
    } = req;
    const response = await getCommonSymptoms(limit, offset, paginationInfo);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error("GetCommonSymptomsController: ", error);
    return next(error);
  }
};
exports.GetCommonSymptomByIDController = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const response = await getCommonSymptom(id);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error("GetCommonSymptomByIDController: ", error);
    return next(error);
  }
};
exports.GetDoctorsController = async (req, res, next) => {
  try {
    const {
      pagination: { limit, offset },
      paginationInfo,
    } = req;
    const { locationId, q: query, specialty_id: specialtyId } = req.query;

    let response;

    if (specialtyId) {
      response = await getDoctorBySpecialtyId(
        specialtyId,
        limit,
        offset,
        paginationInfo,
      );
    } else if (locationId || query) {
      response = await getDoctorByQuery(
        locationId,
        query,
        limit,
        offset,
        paginationInfo,
      );
    } else {
      response = await getAllDoctors(limit, offset, paginationInfo);
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
    const response = await getDoctorById(doctorId);
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
    const {
      pagination: { limit, offset },
      paginationInfo,
    } = req;
    const response = await getMedicalCouncils(limit, offset, paginationInfo);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error("GetMedicalCouncilsController: ", error);
    return next(error);
  }
};
exports.GetMedicalCouncilByIDController = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const response = await getMedicalCouncil(id);
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
    const {
      pagination: { limit, offset },
      paginationInfo,
    } = req;
    const response = await getSpecializations(limit, offset, paginationInfo);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error("GetSpecializationsController: ", error);
    return next(error);
  }
};
exports.GetSpecializationByIDController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const response = await getSpecializationById(id);

    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error("GetSpecializationByIDController: ", error);
    return next(error);
  }
};
exports.GetSpecialtiesController = async (req, res, next) => {
  try {
    const {
      pagination: { limit, offset },
      paginationInfo,
    } = req;
    const response = await getSpecialties(limit, offset, paginationInfo);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error("GetSpecialtiesController: ", error);
    return next(error);
  }
};
exports.GetSpecialtyByIDController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const response = await getSpecialtyById(id);

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
    const {
      pagination: { limit, offset },
      paginationInfo,
    } = req;
    const response = await getTestimonials(limit, offset, paginationInfo);
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
