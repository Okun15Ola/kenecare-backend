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
    console.error(error);
    logger.error(error);
    return next(error);
  }
};
exports.GetBlogByIDController = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const response = await getBlog(id);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
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
    console.error(error);
    logger.error(error);
    return next(error);
  }
};
exports.GetBlogCategoryByIDController = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const response = await getBlogCategory(id);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
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
    console.error(error);
    logger.error(error);
    return next(error);
  }
};
exports.GetCityByIDController = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const response = await getCity(id);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
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
    console.error(error);
    logger.error(error);
    return next(error);
  }
};
exports.GetCommonSymptomByIDController = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const response = await getCommonSymptom(id);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    return next(error);
  }
};
exports.GetDoctorsController = async (req, res, next) => {
  try {
    const {
      pagination: { limit, offset },
      paginationInfo,
    } = req;
    let response = null;
    if (Object.keys(req.query).length > 0) {
      const {
        locationId,
        q: query,
        specialty_id: specialtyId,
      } = req.query || null;
      if (specialtyId) {
        response = await getDoctorBySpecialtyId(
          specialtyId,
          limit,
          offset,
          paginationInfo,
        );
      } else {
        // GET DOCTORS BY LOCATION
        response = await getDoctorByQuery({ locationId, query });
      }
    } else {
      // GET ALL DOCTORS.
      response = await getAllDoctors();
    }

    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    return next(error);
  }
};
exports.GetDoctorByIDController = async (req, res, next) => {
  try {
    const doctorId = parseInt(req.params.id, 10);
    const response = await getDoctorById(doctorId);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    return next(error);
  }
};
exports.GetFaqsController = async (req, res, next) => {
  try {
    return res.sendStatus(200);
  } catch (error) {
    console.error(error);
    logger.error(error);
    return next(error);
  }
};
exports.GetFaqByIdController = async (req, res, next) => {
  try {
    return res.sendStatus(200);
  } catch (error) {
    console.error(error);
    logger.error(error);
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
    console.error(error);
    logger.error(error);
    return next(error);
  }
};
exports.GetMedicalCouncilByIDController = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const response = await getMedicalCouncil(id);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    return next(error);
  }
};
exports.GetMedicalDegreesController = async (req, res, next) => {
  try {
    return res.sendStatus(200);
  } catch (error) {
    console.error(error);
    logger.error(error);
    return next(error);
  }
};
exports.GetMedicalDegreeByIDController = async (req, res, next) => {
  try {
    return res.sendStatus(200);
  } catch (error) {
    console.error(error);
    logger.error(error);
    return next(error);
  }
};
exports.GetSectionOneController = async (req, res, next) => {
  try {
    return res.sendStatus(200);
  } catch (error) {
    console.error(error);
    logger.error(error);
    return next(error);
  }
};
exports.GetServicesController = async (req, res, next) => {
  try {
    return res.sendStatus(200);
  } catch (error) {
    console.error(error);
    logger.error(error);
    return next(error);
  }
};
exports.GetServiceByIDController = async (req, res, next) => {
  try {
    return res.sendStatus(200);
  } catch (error) {
    console.error(error);
    logger.error(error);
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
    console.error(error);
    logger.error(error);
    return next(error);
  }
};
exports.GetSpecializationByIDController = async (req, res, next) => {
  try {
    const { id } = req.params;

    const response = await getSpecializationById(id);

    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
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
    console.error(error);
    logger.error(error);
    return next(error);
  }
};
exports.GetSpecialtyByIDController = async (req, res, next) => {
  try {
    const { id } = req.params;

    const response = await getSpecialtyById(id);

    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    return next(error);
  }
};
exports.GetUserTypesController = async (req, res, next) => {
  try {
    return res.sendStatus(200);
  } catch (error) {
    console.error(error);
    logger.error(error);
    return next(error);
  }
};
exports.GetUserTypeByIDController = async (req, res, next) => {
  try {
    return res.sendStatus(200);
  } catch (error) {
    console.error(error);
    logger.error(error);
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
    console.error(error);
    logger.error(error);
    return next(error);
  }
};
exports.GetTestimonialByIDController = async (req, res, next) => {
  try {
    return res.sendStatus(200);
  } catch (error) {
    console.error(error);
    logger.error(error);
    return next(error);
  }
};
