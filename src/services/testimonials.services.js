const repo = require("../repository/testimonials.repository");
const Response = require("../utils/response.utils");
const { redisClient } = require("../config/redis.config");
const { cacheKeyBulider } = require("../utils/caching.utils");
const { mapTestimonialRow } = require("../utils/db-mapper.utils");

exports.getTestimonials = async (limit, offset, paginationInfo) => {
  try {
    const cacheKey = cacheKeyBulider("testimonials:all", limit, offset);
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({
        data: JSON.parse(cachedData),
        pagination: paginationInfo,
      });
    }
    const rawData = await repo.getAllTestimonials(limit, offset);
    if (!rawData?.length)
      return Response.NOT_FOUND({ message: "Testimonials Not Found" });

    const testimonials = rawData
      .filter((t) => t.is_approved && t.is_active)
      .map(mapTestimonialRow);
    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(testimonials),
    });
    return Response.SUCCESS({ data: testimonials, pagination: paginationInfo });
  } catch (error) {
    console.error(error);
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
      return Response.NOT_FOUND({ message: "Testimonial Not Found" });
    }

    const testimonial = mapTestimonialRow(rawData);
    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(testimonial),
    });
    return Response.SUCCESS({ data: testimonial });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.createTestimonial = async ({ userId, patientId, content }) => {
  try {
    // save to database
    await repo.createNewTestimonial({
      patientId,
      content,
      inputtedBy: userId,
    });

    return Response.CREATED({ message: "Testimonial Created Successfully" });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.approveTestimonialById = async ({ testimonialId, approvedBy }) => {
  try {
    const rawData = await repo.getTestimonialById(testimonialId);

    if (!rawData) {
      return Response.NOT_FOUND({ message: "Testimonial Not Found" });
    }
    await repo.approveTestimonialById({
      testimonialId,
      approvedBy,
    });

    return Response.SUCCESS({ message: "Testimonial Approved Successfully" });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
exports.denyTestimonialById = async ({ testimonialId, approvedBy }) => {
  try {
    const rawData = await repo.getTestimonialById(testimonialId);

    if (!rawData) {
      return Response.NOT_FOUND({ message: "Testimonial Not Found" });
    }
    await repo.denyTestimonialById({
      testimonialId,
      approvedBy,
    });

    return Response.SUCCESS({ message: "Testimonial Denied Successfully" });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.deleteSpecialization = async (specializationId) => {
  try {
    const rawData = await repo.getSpecializationById(specializationId);

    if (!rawData) {
      return Response.NOT_FOUND({ message: "Specialization Not Found" });
    }

    await repo.deleteSpecializationById(specializationId);

    return Response.SUCCESS({ message: "Specialization Deleted Successfully" });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
