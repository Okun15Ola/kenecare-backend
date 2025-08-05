const repo = require("../repository/testimonials.repository");
const Response = require("../utils/response.utils");
const { redisClient } = require("../config/redis.config");
const {
  cacheKeyBulider,
  getCachedCount,
  getPaginationInfo,
} = require("../utils/caching.utils");
const { mapTestimonialRow } = require("../utils/db-mapper.utils");
const logger = require("../middlewares/logger.middleware");

exports.getTestimonials = async (limit, page) => {
  try {
    const offset = (page - 1) * limit;
    const countCacheKey = "testimonials:count";
    const totalRows = await getCachedCount({
      cacheKey: countCacheKey,
      countQueryFn: repo.countTestimonial,
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
    const rawData = await repo.getAllTestimonials(limit, offset);
    if (!rawData?.length) {
      return Response.SUCCESS({ message: "No testimonials found", data: [] });
    }

    const testimonials = await Promise.all(rawData.map(mapTestimonialRow));
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

exports.getTestimonialById = async (id) => {
  try {
    const cacheKey = `testimonials:${id}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }
    const rawData = await repo.getTestimonialById(id);

    if (!rawData) {
      logger.warn(`Testimonial Not Found for ID ${id}`);
      return Response.NOT_FOUND({ message: "Testimonial Not Found" });
    }

    const testimonial = await mapTestimonialRow(rawData);
    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(testimonial),
      expiry: 3600,
    });
    return Response.SUCCESS({ data: testimonial });
  } catch (error) {
    logger.error("getTestimonialById: ", error);
    throw error;
  }
};

exports.createTestimonial = async ({ userId, patientId, content }) => {
  try {
    const { insertId } = await repo.createNewTestimonial({
      patientId,
      content,
      inputtedBy: userId,
    });

    if (!insertId) {
      logger.warn("Failed to create testimonial");
      return Response.NOT_MODIFIED({ message: "Testimonial Not Created" });
    }

    await redisClient.clearCacheByPattern("testimonials:*");

    return Response.CREATED({ message: "Testimonial Created Successfully" });
  } catch (error) {
    logger.error("createTestimonial: ", error);
    throw error;
  }
};

exports.approveTestimonialById = async ({ testimonialId, approvedBy }) => {
  try {
    const rawData = await repo.getTestimonialById(testimonialId);

    if (!rawData) {
      logger.warn(`Testimonial Not Found for ID ${testimonialId}`);
      return Response.NOT_FOUND({ message: "Testimonial Not Found" });
    }
    const { affectedRows } = await repo.approveTestimonialById({
      testimonialId,
      approvedBy,
    });

    if (!affectedRows || affectedRows < 1) {
      logger.warn(`Failed to approve testimonial for ID ${testimonialId}`);
      return Response.NOT_MODIFIED({});
    }

    return Response.SUCCESS({ message: "Testimonial Approved Successfully" });
  } catch (error) {
    logger.error("approveTestimonialById: ", error);
    throw error;
  }
};

exports.denyTestimonialById = async ({ testimonialId, approvedBy }) => {
  try {
    const rawData = await repo.getTestimonialById(testimonialId);

    if (!rawData) {
      logger.warn(`Testimonial Not Found for ID ${testimonialId}`);
      return Response.NOT_FOUND({ message: "Testimonial Not Found" });
    }
    const { affectedRows } = await repo.denyTestimonialById({
      testimonialId,
      approvedBy,
    });

    if (!affectedRows || affectedRows < 1) {
      logger.warn(`Failed to deny testimonial for ID ${testimonialId}`);
      return Response.NOT_MODIFIED({});
    }

    return Response.SUCCESS({ message: "Testimonial Denied Successfully" });
  } catch (error) {
    logger.error("denyTestimonialById: ", error);
    throw error;
  }
};

exports.deleteSpecialization = async (specializationId) => {
  try {
    const rawData = await repo.getSpecializationById(specializationId);

    if (!rawData) {
      logger.warn(`Specialization Not Found for ID ${specializationId}`);
      return Response.NOT_FOUND({ message: "Specialization Not Found" });
    }

    const { affectedRows } =
      await repo.deleteSpecializationById(specializationId);

    if (!affectedRows || affectedRows < 1) {
      logger.warn(`Failed to delete Specialization for ID ${specializationId}`);
      return Response.NOT_MODIFIED({});
    }

    return Response.SUCCESS({ message: "Specialization Deleted Successfully" });
  } catch (error) {
    logger.error("deleteSpecialization: ", error);
    throw error;
  }
};
