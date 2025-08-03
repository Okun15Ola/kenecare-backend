const { v4: uuidv4 } = require("uuid");
const doctorBlogRepository = require("../../repository/doctorBlogs.repository");
const { redisClient } = require("../../config/redis.config");
const logger = require("../../middlewares/logger.middleware");
const Response = require("../../utils/response.utils");
const { fetchLoggedInDoctor } = require("../../utils/helpers.utils");
const {
  uploadFileToS3Bucket,
  deleteFileFromS3Bucket,
} = require("../../utils/aws-s3.utils");
const { generateFileName } = require("../../utils/file-upload.utils");
const { mapDoctorBlog } = require("../../utils/db-mapper.utils");

exports.createDoctorBlogService = async ({
  userId,
  title,
  content,
  image,
  tags,
  status = "draft",
  publishedAt = null,
}) => {
  try {
    if (!image) {
      logger.error("Blog image is required");
      return Response.BAD_REQUEST({
        message: "Please upload a blog image",
      });
    }

    const fileName = generateFileName(image);

    const { $metadata } = await uploadFileToS3Bucket({
      fileName,
      buffer: image.buffer,
      mimetype: image.mimetype,
    });
    if ($metadata.httpStatusCode !== 200) {
      logger.error("Error uploading blog image to S3");
      return Response.INTERNAL_SERVER_ERROR({
        message: "Error Creating New Blog. Please try again",
      });
    }
    const { doctor_id: doctorId } = await fetchLoggedInDoctor(userId);
    if (!doctorId) {
      logger.error("Doctor not found");
      return Response.UNAUTHORIZED({
        message:
          "UnAuthorized Action. Please login as a doctor before proceeding",
      });
    }

    const blogUuid = uuidv4();
    const { insertId } = await doctorBlogRepository.createBlog({
      blogUuid,
      doctorId,
      title,
      content,
      image: fileName,
      tags,
      status,
      publishedAt,
    });

    if (!insertId) {
      logger.error("Fail to create doctor health blog : ");
      return Response.INTERNAL_SERVER_ERROR({
        message: "Something Went Wrong. Please Try Again.",
      });
    }

    await redisClient.clearCacheByPattern(`doctor:${doctorId}:blogs:*`);

    return Response.CREATED({
      message: "Health Blog Created Successfully!",
    });
  } catch (error) {
    logger.error("createDoctorBlogService : ", error);
    throw error;
  }
};

exports.updateDoctorBlogService = async ({
  userId,
  blogUuid,
  title,
  content,
  image,
  tags,
  status = "draft",
  publishedAt = null,
}) => {
  try {
    const existingBlog = await doctorBlogRepository.getBlogByUuid(blogUuid);

    if (!existingBlog) {
      return Response.NOT_FOUND({ message: "Doctor Blog Not Found." });
    }

    if (existingBlog.content === content && existingBlog.title === title) {
      return Response.NOT_MODIFIED({
        message: "No changes detected in blog conten",
      });
    }

    const fileName = existingBlog.image;

    if (image) {
      const { $metadata } = await uploadFileToS3Bucket({
        fileName,
        buffer: image.buffer,
        mimetype: image.mimetype,
      });
      if ($metadata.httpStatusCode !== 200) {
        logger.error("Error uploading blog image to S3");
        return Response.INTERNAL_SERVER_ERROR({
          message: "Error Updating New Blog. Please try again",
        });
      }
    }
    const { doctor_id: doctorId } = await fetchLoggedInDoctor(userId);
    if (!doctorId) {
      logger.error("Doctor not found");
      return Response.UNAUTHORIZED({
        message:
          "UnAuthorized Action. Please login as a doctor before proceeding",
      });
    }

    const { affectedRows } = await doctorBlogRepository.updateBlog({
      doctorId,
      blogUuid,
      title,
      content,
      image: fileName,
      tags,
      status,
      publishedAt,
    });

    if (!affectedRows || affectedRows < 1) {
      logger.error("Fail to update doctor health blog :");
      return Response.NOT_MODIFIED({});
    }

    await redisClient.clearCacheByPattern(`doctor:${doctorId}:blogs:*`);

    return Response.SUCCESS({
      message: "Health Blog Updated Successfully!",
    });
  } catch (error) {
    logger.error("updateDoctorBlogService : ", error);
    throw error;
  }
};

exports.updateDoctorBlogStatusService = async ({
  status,
  userId,
  blogUuid,
}) => {
  try {
    const { doctor_id: doctorId } = await fetchLoggedInDoctor(userId);
    if (!doctorId) {
      logger.error("Doctor not found");
      return Response.UNAUTHORIZED({
        message:
          "UnAuthorized Action. Please login as a doctor before proceeding",
      });
    }

    const existingBlog = await doctorBlogRepository.getBlogByUuid(blogUuid);

    if (!existingBlog) {
      return Response.NOT_FOUND({ message: "Doctor Blog Not Found." });
    }

    if (existingBlog.status === status) {
      return Response.NOT_MODIFIED({ message: `Status is already ${status}` });
    }

    const { affectedRows } = await doctorBlogRepository.updateBlogStatus(
      status,
      doctorId,
      blogUuid,
    );

    if (!affectedRows || affectedRows < 1) {
      logger.error("Fail to update doctor health blog status :");
      return Response.NOT_MODIFIED({});
    }

    await redisClient.clearCacheByPattern(`doctor:${doctorId}:blogs:*`);

    return Response.SUCCESS({
      message: "Health Blog Updated Successfully!",
    });
  } catch (error) {
    logger.error("updateDoctorBlogStatusService : ", error);
    throw error;
  }
};

exports.getBlogsByDoctorService = async (userId) => {
  try {
    const { doctor_id: doctorId } = await fetchLoggedInDoctor(userId);
    if (!doctorId) {
      logger.error("Doctor not found");
      return Response.UNAUTHORIZED({
        message:
          "UnAuthorized Action. Please login as a doctor before proceeding",
      });
    }

    const cacheKey = `doctor:${doctorId}:blogs:all`;
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }
    const data = await doctorBlogRepository.getBlogsByDoctorId(doctorId);

    if (!data?.length) {
      logger.warn("No blog found for doctor with ID : ", doctorId);
      return Response.SUCCESS({
        message: "No blog found for doctor",
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
    logger.error("getBlogsByDoctorService : ", error);
    throw error;
  }
};

exports.getPublishedBlogsByDoctorService = async (userId) => {
  try {
    const { doctor_id: doctorId } = await fetchLoggedInDoctor(userId);
    if (!doctorId) {
      logger.error("Doctor not found");
      return Response.UNAUTHORIZED({
        message:
          "UnAuthorized Action. Please login as a doctor before proceeding",
      });
    }

    const cacheKey = `doctor:${doctorId}:blogs:published`;
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }
    const data = await doctorBlogRepository.getPublishedBlogsByDoctor(doctorId);

    if (!data?.length) {
      logger.warn("No published blog found for doctor with ID : ", doctorId);
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
    logger.error("getPublishedBlogsByDoctorService : ", error);
    throw error;
  }
};

exports.getBlogsByUuidService = async (userId, blogUuid) => {
  try {
    const { doctor_id: doctorId } = await fetchLoggedInDoctor(userId);
    if (!doctorId) {
      logger.error("Doctor not found");
      return Response.UNAUTHORIZED({
        message:
          "UnAuthorized Action. Please login as a doctor before proceeding",
      });
    }

    const cacheKey = `doctor:${doctorId}:blogs:${blogUuid}`;
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }
    const data = await doctorBlogRepository.getBlogByUuid(blogUuid);

    if (!data) {
      logger.warn("No blog found with UUID : ", blogUuid);
      return Response.NOT_FOUND({
        message: "No blog found",
      });
    }

    const blog = await mapDoctorBlog(data);

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(blog),
    });

    return Response.SUCCESS({ data: blog });
  } catch (error) {
    logger.error("getBlogsByUuidService : ", error);
    throw error;
  }
};

exports.deleteDoctorBlogService = async (userId, blogUuid) => {
  try {
    const { doctor_id: doctorId } = await fetchLoggedInDoctor(userId);
    if (!doctorId) {
      logger.error("Doctor not found");
      return Response.UNAUTHORIZED({
        message:
          "UnAuthorized Action. Please login as a doctor before proceeding",
      });
    }
    const blog = await doctorBlogRepository.getBlogByUuid(blogUuid);
    if (!blog) {
      return Response.NOT_FOUND({
        message: "Doctor Blog Not Found.",
      });
    }

    const imageFileName = blog.image;

    const { affectedRows } = await doctorBlogRepository.deleteBlog(
      doctorId,
      blogUuid,
    );

    if (!affectedRows || affectedRows < 1) {
      logger.error("Fail to delete doctor health blog : ");
      return Response.NOT_MODIFIED({
        message: "Failed to delete blog. Please try again.",
      });
    }

    if (imageFileName) {
      try {
        await deleteFileFromS3Bucket(imageFileName);
        logger.info(`Successfully deleted blog image: ${imageFileName}`);
      } catch (s3Error) {
        logger.error(`Error deleting blog image from S3: ${s3Error.message}`);
      }
    }

    await redisClient.clearCacheByPattern(`doctor:${doctorId}:blogs:*`);

    return Response.SUCCESS({
      message: "Health Blog Deleted Successfully!",
    });
  } catch (error) {
    logger.error("deleteDoctorBlogService : ", error);
    throw error;
  }
};
