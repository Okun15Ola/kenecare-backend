const {
  getAllDoctors,
  getDoctorById,
  getDoctorByQuery,
  getDoctorsBySpecializationId,
  getDoctorsCount,
  getDoctorsQueryCount,
  getDoctorsSpecializationCount,
} = require("../repository/doctors.repository");
const {
  getAllCommonSymptoms,
  getCommonSymptomById,
  countCommonSymptom,
} = require("../repository/common-symptoms.repository");
const {
  getAllBlogCategories,
  getBlogCategoryById,
  countBlogCategory,
} = require("../repository/blog-categories.repository");
const {
  getAllBlogs,
  getBlogById,
  countBlog,
} = require("../repository/blogs.repository");
const {
  getAllCities,
  countCity,
  getCityById,
} = require("../repository/cities.repository");
const {
  getAllMedicalCouncils,
  getMedicalCouncilById,
  countMedicalCouncils,
} = require("../repository/medical-councils.repository");
const {
  countSpecialization,
  getAllSpecialization,
  getSpecializationById,
} = require("../repository/specializations.repository");
const {
  getAllSpecialties,
  getSpecialtiyById,
  getSpecialtiyCount,
} = require("../repository/specialities.repository");
const {
  countTestimonial,
  getAllTestimonials,
} = require("../repository/testimonials.repository");
const Response = require("../utils/response.utils");
const {
  mapDoctorRow,
  mapCommonSymptomsRow,
  mapBlogCategoryRow,
  mapBlogRow,
  mapCityRow,
  mapMedicalCouncilRow,
  mapSpecializationRow,
  mapSpecialityRow,
  mapTestimonialRow,
} = require("../utils/db-mapper.utils");
const { redisClient } = require("../config/redis.config");
const {
  cacheKeyBulider,
  getCachedCount,
  getPaginationInfo,
} = require("../utils/caching.utils");
const logger = require("../middlewares/logger.middleware");

exports.getAllDoctorIndexService = async (limit, page) => {
  try {
    const offset = (page - 1) * limit;
    const countCacheKey = "doctors:count:approved";
    const totalRows = await getCachedCount({
      cacheKey: countCacheKey,
      countQueryFn: getDoctorsCount,
    });

    if (!totalRows) {
      return Response.SUCCESS({ message: "No doctors found", data: [] });
    }

    const paginationInfo = getPaginationInfo({ totalRows, limit, page });

    const cacheKey = cacheKeyBulider("doctors:all", limit, offset);
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({
        data: JSON.parse(cachedData),
        pagination: paginationInfo,
      });
    }

    const rawData = await getAllDoctors(limit, offset);

    if (!rawData?.length) {
      return Response.SUCCESS({ message: "No doctors found", data: [] });
    }

    const doctors = await Promise.all(
      rawData.map((doctor) => mapDoctorRow(doctor, true)),
    );

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(doctors),
    });

    return Response.SUCCESS({ data: doctors, pagination: paginationInfo });
  } catch (error) {
    logger.error("getAllDoctors: ", error);
    throw error;
  }
};

exports.getDoctorByQueryIndexService = async (
  locationId,
  query,
  limit,
  page,
) => {
  try {
    const offset = (page - 1) * limit;
    const countCacheKey = "doctors:search:count";
    const totalRows = await getCachedCount({
      cacheKey: countCacheKey,
      countQueryFn: () => getDoctorsQueryCount({ locationId, query }),
    });

    if (!totalRows) {
      return Response.SUCCESS({ message: "No doctors found", data: [] });
    }

    const paginationInfo = getPaginationInfo({ totalRows, limit, page });

    const cacheKey = cacheKeyBulider(
      `doctors:${locationId ? `:location=${locationId}` : ""}
      ${query ? `:query=${query}` : ""}`,
      limit,
      offset,
    );
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({
        data: JSON.parse(cachedData),
        pagination: paginationInfo,
      });
    }
    const rawData = await getDoctorByQuery({
      locationId,
      query,
      limit,
      offset,
    });

    if (!rawData?.length) {
      return Response.SUCCESS({ message: "No doctors found", data: [] });
    }

    const doctors = await Promise.all(
      rawData.map((doctor) => mapDoctorRow(doctor, true)),
    );

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(doctors),
    });

    return Response.SUCCESS({ data: doctors, pagination: paginationInfo });
  } catch (error) {
    logger.error("getDoctorByQuery: ", error);
    throw error;
  }
};

exports.getDoctorBySpecialtyIdIndexService = async (
  specialityId,
  limit,
  page,
) => {
  try {
    const offset = (page - 1) * limit;
    const countCacheKey = "doctors:specialty:count";
    const totalRows = await getCachedCount({
      cacheKey: countCacheKey,
      countQueryFn: () => getDoctorsSpecializationCount(specialityId),
    });

    if (!totalRows) {
      return Response.SUCCESS({
        message: "No doctors available for this specialty",
        data: [],
      });
    }

    const paginationInfo = getPaginationInfo({ totalRows, limit, page });
    const cacheKey = cacheKeyBulider(
      `doctors:speciality:${specialityId}`,
      limit,
      offset,
    );
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({
        data: JSON.parse(cachedData),
        pagination: paginationInfo,
      });
    }
    const rawData = await getDoctorsBySpecializationId(
      specialityId,
      limit,
      offset,
    );

    if (!rawData?.length) {
      return Response.SUCCESS({
        message: "No doctors available for this specialty",
        data: [],
      });
    }

    const doctors = await Promise.all(
      rawData.map((doctor) => mapDoctorRow(doctor, true)),
    );

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(doctors),
    });

    return Response.SUCCESS({ data: doctors, pagination: paginationInfo });
  } catch (error) {
    logger.error("getDoctorBySpecialtyId: ", error);
    throw error;
  }
};

exports.getDoctorByIdIndexService = async (id) => {
  try {
    const cacheKey = `doctor:${id}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({
        data: JSON.parse(cachedData),
      });
    }
    const data = await getDoctorById(id);

    if (!data) {
      logger.error(`Doctor not found for ID: ${id}`);
      return Response.NOT_FOUND({ message: "Doctor Not Found" });
    }

    const doctor = await mapDoctorRow(data, true);

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(doctor),
    });

    return Response.SUCCESS({ data: doctor });
  } catch (error) {
    logger.error("getDoctorById: ", error);
    throw error;
  }
};

exports.getCommonSymptomsIndexService = async (limit, page) => {
  try {
    const offset = (page - 1) * limit;
    const countCacheKey = "common-symptoms:count";
    const totalRows = await getCachedCount({
      cacheKey: countCacheKey,
      countQueryFn: countCommonSymptom,
    });

    if (!totalRows) {
      return Response.SUCCESS({
        message: "No common symptoms found",
        data: [],
      });
    }

    const paginationInfo = getPaginationInfo({ totalRows, limit, page });
    const cacheKey = cacheKeyBulider("common-symptoms:all", limit, offset);
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({
        data: JSON.parse(cachedData),
        pagination: paginationInfo,
      });
    }

    const rawData = await getAllCommonSymptoms(limit, offset);

    if (!rawData?.length) {
      return Response.SUCCESS({
        message: "No common symptoms found",
        data: [],
      });
    }

    const symptoms = await Promise.all(
      rawData.map((symptom) => mapCommonSymptomsRow(symptom, true)),
    );

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(symptoms),
      expiry: 3600,
    });

    return Response.SUCCESS({ data: symptoms, pagination: paginationInfo });
  } catch (error) {
    logger.error("getCommonSymptoms: ", error);
    throw error;
  }
};

exports.getCommonSymptomIndexService = async (id) => {
  try {
    const cacheKey = `common-symptoms:${id}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }
    const rawData = await getCommonSymptomById(id);
    if (!rawData) {
      logger.warn(`Common Symptom Not Found for ID ${id}`);
      return Response.NOT_FOUND({ message: "Common Symptom Not Found" });
    }

    const symptom = await mapCommonSymptomsRow(rawData, true);

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(symptom),
      expiry: 3600,
    });
    return Response.SUCCESS({ data: symptom });
  } catch (error) {
    logger.error("getCommonSymptom: ", error);
    throw error;
  }
};

exports.getBlogCategoriesIndexService = async (limit, page) => {
  try {
    const offset = (page - 1) * limit;
    const countCacheKey = "blog-categories:count";
    const totalRows = await getCachedCount({
      cacheKey: countCacheKey,
      countQueryFn: countBlogCategory,
    });

    if (!totalRows) {
      return Response.SUCCESS({
        message: "No blog categories found",
        data: [],
      });
    }

    const paginationInfo = getPaginationInfo({ totalRows, limit, page });
    const cacheKey = cacheKeyBulider("blog-categories:all", limit, offset);
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({
        data: JSON.parse(cachedData),
        pagination: paginationInfo,
      });
    }
    const rawData = await getAllBlogCategories(limit, offset);

    if (!rawData?.length) {
      return Response.SUCCESS({
        message: "No blog categories found",
        data: [],
      });
    }

    const categories = rawData.map(mapBlogCategoryRow);

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(categories),
      expiry: 3600,
    });

    return Response.SUCCESS({
      data: categories,
      pagination: paginationInfo,
    });
  } catch (error) {
    logger.error("getBlogCategories: ", error);
    throw error;
  }
};

exports.getBlogCategoryIndexService = async (id) => {
  try {
    const cacheKey = `blog-category:${id}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }
    const rawData = await getBlogCategoryById(id);

    if (!rawData) {
      logger.warn(`Blog Category Not Found for ID ${id}`);
      return Response.NOT_FOUND({ message: "Blog Categrory Not Found" });
    }
    const category = mapBlogCategoryRow(rawData);

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(category),
      expiry: 3600,
    });
    return Response.SUCCESS({ data: category });
  } catch (error) {
    logger.error("getBlogCategory: ", error);
    throw error;
  }
};

exports.getBlogsIndexService = async (limit, page) => {
  try {
    const offset = (page - 1) * limit;
    const countCacheKey = "blogs:count";
    const totalRows = await getCachedCount({
      cacheKey: countCacheKey,
      countQueryFn: countBlog,
    });

    if (!totalRows) {
      return Response.SUCCESS({ message: "No blogs found", data: [] });
    }

    const paginationInfo = getPaginationInfo({ totalRows, limit, page });

    const cacheKey = cacheKeyBulider("blogs:all", limit, offset);
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({
        data: JSON.parse(cachedData),
        pagination: paginationInfo,
      });
    }
    const rawData = await getAllBlogs(limit, offset);

    if (!rawData?.length) {
      return Response.SUCCESS({ message: "No blogs found", data: [] });
    }

    const blogs = await Promise.all(
      rawData.map((blog) => mapBlogRow(blog, true)),
    );

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(blogs),
      expiry: 3600,
    });

    return Response.SUCCESS({ data: blogs, pagination: paginationInfo });
  } catch (error) {
    logger.error("getBlogs: ", error);
    throw error;
  }
};

exports.getBlogIndexService = async (id) => {
  try {
    const cacheKey = `blogs:${id}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }
    const rawData = await getBlogById(id);
    if (!rawData) {
      logger.warn(`Blog Not Found for ID ${id}`);
      return Response.NOT_FOUND({ message: "Blog Not Found" });
    }
    const blog = await mapBlogRow(rawData, true);

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(blog),
      expiry: 3600,
    });
    return Response.SUCCESS({ data: blog });
  } catch (error) {
    logger.error("getBlog: ", error);
    throw error;
  }
};

exports.getCitiesIndexService = async (limit, page) => {
  try {
    const offset = (page - 1) * limit;
    const countCacheKey = "cities:count";
    const totalRows = await getCachedCount({
      cacheKey: countCacheKey,
      countQueryFn: countCity,
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
    const [rawData] = await getAllCities(limit, offset);
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

exports.getCityIndexService = async (id) => {
  try {
    const cacheKey = `cities:${id}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }
    const [rawData] = await getCityById(id);
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

exports.getMedicalCouncilsIndexService = async (limit, page) => {
  try {
    const offset = (page - 1) * limit;
    const countCacheKey = "medical-council:count";
    const totalRows = await getCachedCount({
      cacheKey: countCacheKey,
      countQueryFn: countMedicalCouncils,
    });

    if (!totalRows) {
      return Response.SUCCESS({
        message: "No medical councils found",
        data: [],
      });
    }

    const paginationInfo = getPaginationInfo({ totalRows, limit, page });
    const cacheKey = cacheKeyBulider("medical-council:all", limit, offset);
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({
        data: JSON.parse(cachedData),
        pagination: paginationInfo,
      });
    }
    const rawData = await getAllMedicalCouncils(limit, offset);
    if (!rawData?.length) {
      return Response.SUCCESS({
        message: "No medical councils found",
        data: [],
      });
    }

    const councils = rawData.map(mapMedicalCouncilRow);
    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(councils),
      expiry: 3600,
    });
    return Response.SUCCESS({ data: councils, pagination: paginationInfo });
  } catch (error) {
    logger.error("getMedicalCouncils: ", error);
    throw error;
  }
};

exports.getMedicalCouncilIndexService = async (id) => {
  try {
    const cacheKey = `medical-council:${id}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }
    const rawData = await getMedicalCouncilById(id);

    if (!rawData) {
      logger.warn(`Medical Council Not Found for ID ${id}`);
      return Response.NOT_FOUND({ message: "Medical Council Not Found" });
    }
    const council = mapMedicalCouncilRow(rawData);
    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(council),
      expiry: 3600,
    });
    return Response.SUCCESS({ data: council });
  } catch (error) {
    logger.error("getMedicalCouncil: ", error);
    throw error;
  }
};

exports.getSpecializationsIndexService = async (limit, page) => {
  try {
    const offset = (page - 1) * limit;
    const countCacheKey = "specializations:count";
    const totalRows = await getCachedCount({
      cacheKey: countCacheKey,
      countQueryFn: countSpecialization,
    });

    if (!totalRows) {
      return Response.SUCCESS({ message: "No specialization found", data: [] });
    }

    const paginationInfo = getPaginationInfo({ totalRows, limit, page });
    const cacheKey = cacheKeyBulider("specializations:all", limit, offset);
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({
        data: JSON.parse(cachedData),
        pagination: paginationInfo,
      });
    }
    const rawData = await getAllSpecialization(limit, offset);

    if (!rawData?.length) {
      return Response.SUCCESS({ message: "No specialization found", data: [] });
    }

    const specializations = rawData.map(mapSpecializationRow);
    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(specializations),
      expiry: 3600,
    });
    return Response.SUCCESS({
      data: specializations,
      pagination: paginationInfo,
    });
  } catch (error) {
    logger.error("getSpecializations: ", error);
    throw error;
  }
};

exports.getSpecializationByIdIndexService = async (id) => {
  try {
    const cacheKey = `specializations:${id}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }
    const rawData = await getSpecializationById(id);

    if (!rawData) {
      logger.warn("Specialization Not Found");
      return Response.NOT_FOUND({ message: "Specialization Not Found" });
    }
    const specialization = mapSpecializationRow(rawData);

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(specialization),
      expiry: 3600,
    });
    return Response.SUCCESS({ data: specialization });
  } catch (error) {
    logger.error("getSpecializationById: ", error);
    throw error;
  }
};

exports.getSpecialtiesIndexService = async (limit, page) => {
  try {
    const offset = (page - 1) * limit;
    const countCacheKey = "specialties:count";
    const totalRows = await getCachedCount({
      cacheKey: countCacheKey,
      countQueryFn: getSpecialtiyCount,
    });

    if (!totalRows) {
      return Response.SUCCESS({ message: "No specialties found", data: [] });
    }

    const paginationInfo = getPaginationInfo({ totalRows, limit, page });

    const cacheKey = cacheKeyBulider("specialties:all", limit, offset);

    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData), paginationInfo });
    }

    const rawData = await getAllSpecialties(limit, offset);
    if (!rawData?.length) {
      return Response.SUCCESS({ message: "No specialties found", data: [] });
    }

    const specialties = await Promise.all(
      rawData.map((specialty) => mapSpecialityRow(specialty, true, true)),
    );

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(specialties),
      expiry: 3600,
    });
    return Response.SUCCESS({ data: specialties, pagination: paginationInfo });
  } catch (error) {
    logger.error("getSpecialties: ", error);
    throw error;
  }
};

exports.getSpecialtyByIdIndexService = async (id) => {
  try {
    const cacheKey = `specialty:${id}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }
    const rawData = await getSpecialtiyById(id);

    if (!rawData) {
      logger.warn(`Specialty Not Found for ID ${id}`);
      return Response.NOT_FOUND({ message: "Specialty Not Found" });
    }

    const specialty = await mapSpecialityRow(rawData, true, true);
    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(specialty),
      expiry: 3600,
    });
    return Response.SUCCESS({ data: specialty });
  } catch (error) {
    logger.error("getSpecialtyById: ", error);
    throw error;
  }
};

exports.getTestimonialsIndexService = async (limit, page) => {
  try {
    const offset = (page - 1) * limit;
    const countCacheKey = "testimonials:count";
    const totalRows = await getCachedCount({
      cacheKey: countCacheKey,
      countQueryFn: countTestimonial,
    });

    if (!totalRows) {
      return Response.SUCCESS({ message: "No testimonials found", data: [] });
    }

    const paginationInfo = getPaginationInfo({ totalRows, limit, page });

    const cacheKey = cacheKeyBulider("testimonials:all", limit, offset);
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({
        data: JSON.parse(cachedData),
        pagination: paginationInfo,
      });
    }
    const rawData = await getAllTestimonials(limit, offset);
    if (!rawData?.length) {
      return Response.SUCCESS({ message: "No testimonials found", data: [] });
    }

    const testimonials = await Promise.all(
      rawData.map((testimonial) => mapTestimonialRow(testimonial, true)),
    );
    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(testimonials),
      expiry: 3600,
    });
    return Response.SUCCESS({ data: testimonials, pagination: paginationInfo });
  } catch (error) {
    logger.error("getTestimonials: ", error);
    return error;
  }
};
