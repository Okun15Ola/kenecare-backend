const dbObject = require("../db/db.testimonials");
const Response = require("../utils/response.utils");
const { appBaseURL } = require("../config/default.config");
exports.getTestimonials = async () => {
  try {
    const rawData = await dbObject.getAllTestimonials();

    if (rawData) {
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
        }) => {
          return {
            testimonialId,
            patientName: `${firstName} ${lastName}`,
            patientPic: `${appBaseURL}/user-profile/${patientPic}`,
            content,
            isActive,
            isApproved,
            approvedBy,
          };
        }
      );
      return Response.SUCCESS({ data: testimonials });
    }
  } catch (error) {}
};

exports.getTestimonialById = async (id) => {
  try {
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
    return Response.SUCCESS({ data: testimonial });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/**
 * Create a new specialization in the database.
 *
 * @async
 * @function createSpecialization
 * @param {Object} specializationData - The data for the new specialization.
 * @param {string} specializationData.name - The name of the specialization.
 * @param {string} [specializationData.description=""] - Optional description for the specialization.
 * @param {string} specializationData.image_url - The URL of the image associated with the specialization.
 * @returns {Promise<void>} A promise that resolves when the specialization is successfully created.
 * @throws {Error} If there's an issue with the database operation.
 *
 * @example
 * const specializationData = {
 *   name: "Cardiology",
 *   description: "Dealing with heart-related issues",
 *   image_url: "https://example.com/cardiology.jpg"
 * };
 *
 * try {
 *   await createSpecialization(specializationData);
 *   console.log("Specialization created successfully.");
 * } catch (error) {
 *   console.error("Error creating specialization:", error);
 * }
 */
exports.createSpecialization = async ({ name, description, imageUrl }) => {
  try {
    const rawData = await dbObject.getSpecializationByName(name);
    if (rawData) {
      return Response.BAD_REQUEST({
        message: "Specialization Name already exists",
      });
    }
    //create new object
    const specialization = {
      name,
      description,
      imageUrl,
      inputtedBy: 1,
    };

    //save to database
    await dbObject.createNewSpecialization(specialization);

    return Response.CREATED({ message: "Specialization Created Successfully" });
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

exports.updateSpecializationStatus = async ({ specializationId, status }) => {
  try {
    const rawData = await dbObject.getSpecializationById(specializationId);

    if (!rawData) {
      return Response.NOT_FOUND({ message: "Specialization Not Found" });
    }

    if (!Number.isInteger(status) || status < 0 || status > 1) {
      return Response.BAD_REQUEST({ message: "Invalid Status Code" });
    }

    await dbObject.updateSpecializationStatusById({
      specializationId,
      status,
    });

    return Response.SUCCESS({
      message: "Specialization Status Updated Successfully",
    });
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
