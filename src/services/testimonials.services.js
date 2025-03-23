const dbObject = require("../db/db.testimonials");
const Response = require("../utils/response.utils");
const { appBaseURL } = require("../config/default.config");
const redisClient = require("../config/redis.config");

exports.getTestimonials = async () => {
  try {
    const cacheKey = "testimonials:all";
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }
    const rawData = await dbObject.getAllTestimonials();
    if (!rawData) return null;

    const testimonials = rawData.map(
      ({
        testimonial_id: testimonialId,
        first_name: firstName,
        last_name: lastName,
        profile_pic_url: patientPic,
        testimonial_content: content,
        is_active: isActive,
        is_approved: isApproved,
        approved_by: approvedBy,
      }) => ({
        testimonialId,
        patientName: `${firstName} ${lastName}`,
        patientPic: `${appBaseURL}/user-profile/${patientPic}`,
        content,
        isActive,
        isApproved,
        approvedBy,
      }),
    );
    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(testimonials),
    });
    return Response.SUCCESS({ data: testimonials });
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
    const rawData = await dbObject.getTestimonialById(id);

    if (!rawData) {
      return Response.NOT_FOUND({ message: "Testimonial Not Found" });
    }
    const {
      testimonial_id: testimonialId,
      first_name: firstName,
      last_name: lastName,
      profile_pic_url: patientPic,
      testimonial_content: content,
      is_active: isActive,
      is_approved: isApproved,
      approved_by: approvedBy,
    } = rawData;

    const testimonial = {
      testimonialId,
      patientName: `${firstName} ${lastName}`,
      patientPic,
      content,
      isActive,
      isApproved,
      approvedBy,
    };
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
    await dbObject.createNewTestimonial({
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
    const rawData = await dbObject.getTestimonialById(testimonialId);

    if (!rawData) {
      return Response.NOT_FOUND({ message: "Testimonial Not Found" });
    }
    await dbObject.approveTestimonialById({
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
    const rawData = await dbObject.getTestimonialById(testimonialId);

    if (!rawData) {
      return Response.NOT_FOUND({ message: "Testimonial Not Found" });
    }
    await dbObject.denyTestimonialById({
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
    const rawData = await dbObject.getSpecializationById(specializationId);

    if (!rawData) {
      return Response.NOT_FOUND({ message: "Specialization Not Found" });
    }

    await dbObject.deleteSpecializationById(specializationId);

    return Response.SUCCESS({ message: "Specialization Deleted Successfully" });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
