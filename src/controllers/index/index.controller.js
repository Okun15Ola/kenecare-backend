const logger = require("../../middlewares/logger.middleware");
const {
  getBlogCategories,
  getBlogCategory,
} = require("../../services/blog-categories.services");
const { getBlogs, getBlog } = require("../../services/blogs.services");
const { getCities, getCity } = require("../../services/cities.services");
const {
  getCommonSymptoms,
  getCommonSymptom,
} = require("../../services/common-symptoms.services");
const {
  getAllDoctors,
  getDoctorById,
  getDoctorBySpecialtyId,
  getDoctorByQuery,
} = require("../../services/doctors.services.js");

const {
  getMedicalCouncils,
  getMedicalCouncil,
} = require("../../services/medical-councils.services");
const {
  getSpecializations,
  getSpecializationById,
} = require("../../services/specializations.services");
const {
  getSpecialties,
  getSpecialtyById,
} = require("../../services/specialties.services");
const { getTestimonials } = require("../../services/testimonials.services");
const {} = require("../../services/faq.services");

exports.GetBlogsController = async (req, res, next) => {
  try {
    const response = await getBlogs();
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
exports.GetBlogByIDController = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const response = await getBlog(id);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
exports.GetBlogCategoriesController = async (req, res, next) => {
  try {
    const response = await getBlogCategories();
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
exports.GetBlogCategoryByIDController = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const response = await getBlogCategory(id);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
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
exports.GetCommonSymptomsController = async (req, res, next) => {
  try {
    const response = await getCommonSymptoms();

    response.data = response.data.map(
      ({
        symptomId,
        name,
        imageUrl,
        description,
        tags,
        consultationFee,
        specialty,
      }) => {
        return {
          symptomId,
          name,
          imageUrl,
          description,
          consultationFee,
          specialty,
          tags,
        };
      }
    );

    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
exports.GetCommonSymptomByIDController = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const response = await getCommonSymptom(id);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
exports.GetDoctorsController = async (req, res, next) => {
  try {
    let response = null;
    if (Object.keys(req.query).length > 0) {
      const {
        locationId,
        q: query,
        specialty_id: specialtyId,
      } = req.query || null;
      if (specialtyId) {
        response = await getDoctorBySpecialtyId(specialtyId);
      } else {
        //GET DOCTORS BY LOCATION
        response = await getDoctorByQuery({ locationId, query });
      }
    } else {
      //GET ALL DOCTORS.
      response = await getAllDoctors();
    }

    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
exports.GetDoctorByIDController = async (req, res, next) => {
  try {
    const doctorId = parseInt(req.params.id);
    const response = await getDoctorById(doctorId);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
exports.GetFaqsController = async (req, res, next) => {
  try {
    return res.sendStatus(200);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
exports.GetFaqByIdController = async (req, res, next) => {
  try {
    return res.sendStatus(200);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
exports.GetMedicalCouncilsController = async (req, res, next) => {
  try {
    const response = await getMedicalCouncils();
    response.data = response.data.map(
      ({ councilId, councilName, email, address, mobileNumber }) => {
        return { councilId, councilName, email, address, mobileNumber };
      }
    );
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
exports.GetMedicalCouncilByIDController = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const response = await getMedicalCouncil(id);
    response.data = response.data.map(
      ({ councilId, councilName, email, address, mobileNumber }) => {
        return { councilId, councilName, email, address, mobileNumber };
      }
    );
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
exports.GetMedicalDegreesController = async (req, res, next) => {
  try {
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
exports.GetMedicalDegreeByIDController = async (req, res, next) => {
  try {
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
exports.GetSectionOneController = async (req, res, next) => {
  try {
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
exports.GetServicesController = async (req, res, next) => {
  try {
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
exports.GetServiceByIDController = async (req, res, next) => {
  try {
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
exports.GetSpecializationsController = async (req, res, next) => {
  try {
    const response = await getSpecializations();
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
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
    next(error);
  }
};
exports.GetSpecialtiesController = async (req, res, next) => {
  try {
    const response = await getSpecialties();

    response.data = response.data.map(
      ({ specialtyId, specialtyName, description, imageUrl }) => {
        return { specialtyId, specialtyName, description, imageUrl };
      }
    );

    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
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
    next(error);
  }
};
exports.GetUserTypesController = async (req, res, next) => {
  try {
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
exports.GetUserTypeByIDController = async (req, res, next) => {
  try {
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
exports.GetTestimonialsController = async (req, res, next) => {
  try {
    const response = await getTestimonials();

    response.data = response.data
      .filter((t) => t.isApproved && t.isActive)
      .map(({ testimonialId, patientName, patientPic, content }) => {
        return {
          testimonialId,
          patientName,
          patientPic,
          content,
        };
      });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
exports.GetTestimonialByIDController = async (req, res, next) => {
  try {
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
