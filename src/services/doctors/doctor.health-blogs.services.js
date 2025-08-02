const { v4: uuidv4 } = require("uuid");
const doctorBlogRepository = require("../../repository/doctorBlogs.repository");
const { redisClient } = require("../../config/redis.config");
const logger = require("../../middlewares/logger.middleware");
const Response = require("../../utils/response.utils");
const { fetchLoggedInDoctor } = require("../../utils/helpers.utils");
const { uploadFileToS3Bucket } = require("../../utils/aws-s3.utils");
const { generateFileName } = require("../../utils/file-upload.utils");

exports.createDoctorBlogService = async ({
  userId,
  title,
  content,
  image,
  tags = null,
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
    const { doctorId } = await fetchLoggedInDoctor(userId);
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
  tags = null,
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
        message: "Error Updating New Blog. Please try again",
      });
    }
    const { doctorId } = await fetchLoggedInDoctor(userId);
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
    const { doctorId } = await fetchLoggedInDoctor(userId);
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
    const { doctorId } = await fetchLoggedInDoctor(userId);

    const cacheKey = `doctor:${doctorId}:blogs`;
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

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(data),
    });

    return Response.SUCCESS({ data });
  } catch (error) {
    logger.error("getBlogsByDoctorService : ", error);
    throw error;
  }
};

exports.getPublishedBlogsByDoctorService = async (userId) => {
  try {
    const { doctorId } = await fetchLoggedInDoctor(userId);

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

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(data),
    });

    return Response.SUCCESS({ data });
  } catch (error) {
    logger.error("getPublishedBlogsByDoctorService : ", error);
    throw error;
  }
};

exports.getBlogsByUuidService = async (userId, blogUuid) => {
  try {
    const { doctorId } = await fetchLoggedInDoctor(userId);

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

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(data),
    });

    return Response.SUCCESS({ data });
  } catch (error) {
    logger.error("getBlogsByUuidService : ", error);
    throw error;
  }
};

exports.deleteDoctorBlogService = async (userId, blogUuid) => {
  try {
    const { doctorId } = await fetchLoggedInDoctor(userId);
    const { affectedRows } = await doctorBlogRepository.deleteBlog(
      doctorId,
      blogUuid,
    );

    if (!affectedRows || affectedRows < 1) {
      logger.error("Fail to delete doctor health blog : ");
      return Response.NOT_MODIFIED({});
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
