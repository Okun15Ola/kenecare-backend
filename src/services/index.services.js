const he = require("he");
const {
  getAllDoctors,
  getDoctorById,
  getDoctorByQuery,
  getDoctorsBySpecializationId,
} = require("../repository/doctors.repository");
const {
  getAllCommonSymptoms,
  getCommonSymptomById,
} = require("../repository/common-symptoms.repository");
const {
  getAllBlogCategories,
  getBlogCategoryById,
} = require("../repository/blog-categories.repository");
const { getAllBlogs, getBlogById } = require("../repository/blogs.repository");
const {
  getAllCities,
  getCityById,
} = require("../repository/cities.repository");
const {
  getAllMedicalCouncils,
  getMedicalCouncilById,
} = require("../repository/medical-councils.repository");
const {
  getAllSpecialization,
  getSpecializationById,
} = require("../repository/specializations.repository");
const {
  getAllSpecialties,
  getSpecialtiyById,
} = require("../repository/specialities.repository");
const { getAllTestimonials } = require("../repository/testimonials.repository");
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
  mapDoctorBlog,
  mapDoctorUserProfileRow,
} = require("../utils/db-mapper.utils");
const doctorBlogRepository = require("../repository/doctorBlogs.repository");
const doctorFaqRepository = require("../repository/doctorFaqs.repository");
const { redisClient } = require("../config/redis.config");
const {
  cacheKeyBulider,
  getPaginationInfo,
} = require("../utils/caching.utils");
const logger = require("../middlewares/logger.middleware");
const faqRepository = require("../repository/faqs.repository");

exports.getAllDoctorIndexService = async (limit, page) => {
  try {
    const offset = (page - 1) * limit;

    const cacheKey = cacheKeyBulider("doctors:all", limit, offset);
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      const { data, pagination } = JSON.parse(cachedData);
      return Response.SUCCESS({
        data,
        pagination,
      });
    }

    const rawData = await getAllDoctors(limit, offset);

    if (!rawData?.length) {
      return Response.SUCCESS({ message: "No doctors found", data: [] });
    }

    const { totalRows } = rawData[0];
    const paginationInfo = getPaginationInfo({ totalRows, limit, page });

    const doctors = await Promise.all(
      rawData.map((doctor) => mapDoctorRow(doctor, true)),
    );

    const valueToCache = {
      data: doctors,
      pagination: paginationInfo,
    };

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(valueToCache),
      expiry: 60,
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
    const cacheKey = cacheKeyBulider(
      `doctors:${locationId ? `:location=${locationId}` : ""}
      ${query ? `:query=${query}` : ""}`,
      limit,
      offset,
    );
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      const { data, pagination } = JSON.parse(cachedData);
      return Response.SUCCESS({
        data,
        pagination,
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

    const { totalRows } = rawData[0];
    const paginationInfo = getPaginationInfo({ totalRows, limit, page });

    const doctors = await Promise.all(
      rawData.map((doctor) => mapDoctorRow(doctor, true)),
    );

    const valueToCache = {
      data: doctors,
      pagination: paginationInfo,
    };

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(valueToCache),
      expiry: 60,
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

    const cacheKey = cacheKeyBulider(
      `doctors:speciality:${specialityId}`,
      limit,
      offset,
    );
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      const { data, pagination } = JSON.parse(cachedData);
      return Response.SUCCESS({
        data,
        pagination,
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

    const { totalRows } = rawData[0];
    const paginationInfo = getPaginationInfo({ totalRows, limit, page });

    const doctors = await Promise.all(
      rawData.map((doctor) => mapDoctorRow(doctor, true)),
    );

    const valueToCache = {
      data: doctors,
      pagination: paginationInfo,
    };

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(valueToCache),
      expiry: 60,
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

    const doctor = await mapDoctorUserProfileRow(data);

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(doctor),
      expiry: 60,
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

    const cacheKey = cacheKeyBulider("common-symptoms:all", limit, offset);
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      const { data, pagination } = JSON.parse(cachedData);
      return Response.SUCCESS({
        data,
        pagination,
      });
    }

    const rawData = await getAllCommonSymptoms(limit, offset);

    if (!rawData?.length) {
      return Response.SUCCESS({
        message: "No common symptoms found",
        data: [],
      });
    }

    const { totalRows } = rawData[0];
    const paginationInfo = getPaginationInfo({ totalRows, limit, page });

    const symptoms = await Promise.all(
      rawData.map((symptom) => mapCommonSymptomsRow(symptom, true)),
    );

    const valueToCache = {
      data: symptoms,
      pagination: paginationInfo,
    };

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(valueToCache),
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
    const cacheKey = cacheKeyBulider("blog-categories:all", limit, offset);
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      const { data, pagination } = JSON.parse(cachedData);
      return Response.SUCCESS({
        data,
        pagination,
      });
    }
    const rawData = await getAllBlogCategories(limit, offset);

    if (!rawData?.length) {
      return Response.SUCCESS({
        message: "No blog categories found",
        data: [],
      });
    }

    const { totalRows } = rawData[0];
    const paginationInfo = getPaginationInfo({ totalRows, limit, page });

    const categories = rawData.map(mapBlogCategoryRow);

    const valueToCache = {
      data: categories,
      pagination: paginationInfo,
    };

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(valueToCache),
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

    const cacheKey = cacheKeyBulider("blogs:all", limit, offset);
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      const { data, pagination } = JSON.parse(cachedData);
      return Response.SUCCESS({
        data,
        pagination,
      });
    }
    const rawData = await getAllBlogs(limit, offset);

    if (!rawData?.length) {
      return Response.SUCCESS({ message: "No blogs found", data: [] });
    }

    const { totalRows } = rawData[0];
    const paginationInfo = getPaginationInfo({ totalRows, limit, page });

    const blogs = await Promise.all(
      rawData.map((blog) => mapBlogRow(blog, true)),
    );

    const valueToCache = {
      data: blogs,
      pagination: paginationInfo,
    };

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(valueToCache),
      expiry: 3600,
    });

    return Response.SUCCESS({ data: blogs, pagination: paginationInfo });
  } catch (error) {
    logger.error("getBlogs: ", error);
    throw error;
  }
};

exports.getPublishedBlogsByDoctorIndexService = async (doctorId) => {
  try {
    const cacheKey = `doctor:${doctorId}:blogs:published`;
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }
    const data = await doctorBlogRepository.getPublishedBlogsByDoctor(doctorId);

    if (!data?.length) {
      return Response.SUCCESS({
        message: "No published blog found for doctor",
        data: [],
      });
    }

    const blogs = await Promise.all(data.map(mapDoctorBlog));

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(blogs),
    });

    return Response.SUCCESS({ data: blogs });
  } catch (error) {
    logger.error("getPublishedBlogsByDoctorIndexService : ", error);
    throw error;
  }
};

exports.getDoctorActiveFaqsIndexService = async (doctorId, limit, page) => {
  try {
    const offset = (page - 1) * limit;

    const cacheKey = cacheKeyBulider(
      `doctor:${doctorId}:faq:active:all`,
      limit,
      offset,
    );
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      const { data, pagination } = JSON.parse(cachedData);
      return Response.SUCCESS({
        data,
        pagination,
      });
    }

    const data = await doctorFaqRepository.getAllActiveDoctorFaqByDoctorId(
      doctorId,
      limit,
      offset,
    );

    if (!data?.length) {
      return Response.SUCCESS({
        message: "No doctor active faq found",
        data: [],
      });
    }

    const { totalRows } = data[0];
    const paginationInfo = getPaginationInfo({ totalRows, limit, page });

    const valueToCache = {
      data,
      pagination: paginationInfo,
    };

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(valueToCache),
    });

    return Response.SUCCESS({
      data,
      pagination: paginationInfo,
    });
  } catch (error) {
    logger.error("getDoctorActiveFaqsIndexService: ", error);
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
    const cacheKey = cacheKeyBulider("cities:all", limit, offset);
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      const { data, pagination } = JSON.parse(cachedData);
      return Response.SUCCESS({
        data,
        pagination,
      });
    }
    const [rawData] = await getAllCities(limit, offset);
    if (!rawData?.length) {
      return Response.SUCCESS({ message: "No cities found", data: [] });
    }

    const { totalRows } = rawData[0];
    const paginationInfo = getPaginationInfo({ totalRows, limit, page });

    const cities = rawData.map(mapCityRow);

    const valueToCache = {
      data: cities,
      pagination: paginationInfo,
    };

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(valueToCache),
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
    const cacheKey = cacheKeyBulider("medical-council:all", limit, offset);
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      const { data, pagination } = JSON.parse(cachedData);
      return Response.SUCCESS({
        data,
        pagination,
      });
    }
    const rawData = await getAllMedicalCouncils(limit, offset);
    if (!rawData?.length) {
      return Response.SUCCESS({
        message: "No medical councils found",
        data: [],
      });
    }

    const { totalRows } = rawData[0];
    const paginationInfo = getPaginationInfo({ totalRows, limit, page });

    const councils = rawData.map(mapMedicalCouncilRow);
    const valueToCache = {
      data: councils,
      pagination: paginationInfo,
    };

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(valueToCache),
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
    const cacheKey = cacheKeyBulider("specializations:all", limit, offset);
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      const { data, pagination } = JSON.parse(cachedData);
      return Response.SUCCESS({
        data,
        pagination,
      });
    }
    const rawData = await getAllSpecialization(limit, offset);

    if (!rawData?.length) {
      return Response.SUCCESS({ message: "No specialization found", data: [] });
    }

    const { totalRows } = rawData[0];
    const paginationInfo = getPaginationInfo({ totalRows, limit, page });

    const specializations = rawData.map(mapSpecializationRow);
    const valueToCache = {
      data: specializations,
      pagination: paginationInfo,
    };

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(valueToCache),
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

    const cacheKey = cacheKeyBulider("specialties:all", limit, offset);

    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      const { data, pagination } = JSON.parse(cachedData);
      return Response.SUCCESS({
        data,
        pagination,
      });
    }

    const rawData = await getAllSpecialties(limit, offset);
    if (!rawData?.length) {
      return Response.SUCCESS({ message: "No specialties found", data: [] });
    }

    const { totalRows } = rawData[0];
    const paginationInfo = getPaginationInfo({ totalRows, limit, page });

    const specialties = await Promise.all(
      rawData.map((specialty) => mapSpecialityRow(specialty, true, true)),
    );

    const valueToCache = {
      data: specialties,
      pagination: paginationInfo,
    };

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(valueToCache),
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
    const cacheKey = cacheKeyBulider("testimonials:all", limit, offset);
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      const { data, pagination } = JSON.parse(cachedData);
      return Response.SUCCESS({
        data,
        pagination,
      });
    }
    const rawData = await getAllTestimonials(limit, offset);
    if (!rawData?.length) {
      return Response.SUCCESS({ message: "No testimonials found", data: [] });
    }

    const { totalRows } = rawData[0];
    const paginationInfo = getPaginationInfo({ totalRows, limit, page });

    const testimonials = await Promise.all(
      rawData.map((testimonial) => mapTestimonialRow(testimonial, true, true)),
    );

    const valueToCache = {
      data: testimonials,
      pagination: paginationInfo,
    };

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(valueToCache),
      expiry: 3600,
    });
    return Response.SUCCESS({ data: testimonials, pagination: paginationInfo });
  } catch (error) {
    logger.error("getTestimonials: ", error);
    return error;
  }
};

exports.getIndexFaqService = async (page, limit) => {
  try {
    const offset = (page - 1) * limit;

    const cacheKey = cacheKeyBulider("faqs:published", limit, offset);
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      const { data, pagination } = JSON.parse(cachedData);
      return Response.SUCCESS({
        data,
        pagination,
      });
    }
    const rawData = await faqRepository.getPublishedFaqs(limit, offset);
    if (!rawData?.length) {
      return Response.SUCCESS({ message: "No faq found", data: [] });
    }

    const { totalRows } = rawData[0];
    const paginationInfo = getPaginationInfo({ totalRows, limit, page });

    const faqs = rawData.map((faq) => ({
      id: faq.faq_uuid,
      question: he.decode(faq.question),
      answer: he.decode(faq.answer),
      category: faq.category || "Uncategorized",
    }));

    const valueToCache = {
      data: faqs,
      pagination: paginationInfo,
    };

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(valueToCache),
      expiry: 86400,
    });
    return Response.SUCCESS({ data: faqs, pagination: paginationInfo });
  } catch (error) {
    logger.error("getIndexFaqService", error);
    throw error;
  }
};
