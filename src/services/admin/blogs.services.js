const dbObject = require("../../repository/blogs.repository");
const { uploadFileToS3Bucket } = require("../../utils/aws-s3.utils");
const { generateFileName } = require("../../utils/file-upload.utils");
const Response = require("../../utils/response.utils");
const { redisClient } = require("../../config/redis.config");
const { mapBlogRow } = require("../../utils/db-mapper.utils");
const {
  cacheKeyBulider,
  getPaginationInfo,
} = require("../../utils/caching.utils");
const logger = require("../../middlewares/logger.middleware");

exports.getBlogs = async (limit, page) => {
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
    const rawData = await dbObject.getAllBlogs(limit, offset);

    if (!rawData?.length) {
      return Response.SUCCESS({ message: "No blogs found", data: [] });
    }

    const { totalRows } = rawData[0];
    const paginationInfo = getPaginationInfo({ totalRows, limit, page });

    const blogs = await Promise.all(rawData.map(mapBlogRow));

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

exports.getBlog = async (id) => {
  try {
    const cacheKey = `blogs:${id}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }
    const rawData = await dbObject.getBlogById(id);
    if (!rawData) {
      logger.warn(`Blog Not Found for ID ${id}`);
      return Response.NOT_FOUND({ message: "Blog Not Found" });
    }
    const blog = await mapBlogRow(rawData);

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

exports.createBlog = async ({
  category,
  title,
  content,
  file,
  tags,
  featured,
  inputtedBy,
}) => {
  try {
    if (!file) {
      logger.error("Blog image is required");
      return Response.BAD_REQUEST({ message: "Please upload a blog image" });
    }

    const fileName = generateFileName(file);

    const { $metadata } = await uploadFileToS3Bucket({
      fileName,
      buffer: file.buffer,
      mimetype: file.mimetype,
    });
    if ($metadata.httpStatusCode !== 200) {
      logger.error("Error uploading blog image to S3");
      return Response.INTERNAL_SERVER_ERROR({
        message: "Error Creating New Blog. Please try again",
      });
    }

    const { insertId } = await dbObject.createNewBlog({
      category,
      title,
      content,
      image: fileName,
      tags,
      featured,
      inputtedBy,
    });

    if (!insertId) {
      logger.warn("Failed to create blog");
      return Response.NOT_MODIFIED({ message: "Blog Not Created" });
    }

    // clear cache
    await redisClient.clearCacheByPattern("blogs:*");
    await redisClient.clearCacheByPattern("blog_public_img:*");
    await redisClient.clearCacheByPattern("blog_private_img:*");
    return Response.CREATED({ message: "Blog Created Successfully" });
  } catch (error) {
    logger.error("createBlog: ", error);
    throw error;
  }
};

exports.updateBlog = async ({
  id,
  category,
  title,
  content,
  tags,
  file,
  featured,
}) => {
  try {
    const blog = await dbObject.getBlogById(id);
    if (!blog) {
      logger.warn(`Blog Not Found for ID ${id}`);
      return Response.NOT_FOUND({ message: "Blog Not Found" });
    }

    const { image } = blog;
    let fileName = "";
    if (file) {
      fileName = image || generateFileName(file);
      if (fileName) {
        uploadFileToS3Bucket({
          fileName,
          buffer: file.buffer,
          mimetype: file.mimetype,
        });
      }
    }

    const { affectedRows } = await dbObject.updateBlogById({
      id,
      category,
      title,
      content,
      tags,
      file: fileName,
      featured,
    });

    if (!affectedRows || affectedRows < 1) {
      logger.warn(`Failed to update blog for ID ${id}`);
      return Response.NOT_MODIFIED({});
    }

    // clear cache
    await redisClient.clearCacheByPattern("blogs:*");
    await redisClient.delete(`blog_public_img:${id}`);
    await redisClient.delete(`blog_private_img:${id}`);

    return Response.SUCCESS({ message: "Blog Updated Succcessfully" });
  } catch (error) {
    logger.error("updateBlog: ", error);
    throw error;
  }
};

exports.updateBlogStatus = async ({ id, status }) => {
  try {
    const rawData = await dbObject.getBlogById(id);
    if (!rawData) {
      logger.warn("Blog Not Found");
      return Response.NOT_FOUND({ message: "Blog Not Found" });
    }
    const { affectedRows } = await dbObject.updateBlogStatusById({
      id,
      status,
    });

    if (!affectedRows || affectedRows < 1) {
      logger.warn(`Failed to update blog status for ID ${id}`);
      return Response.NOT_MODIFIED({});
    }

    // clear cache
    await redisClient.clearCacheByPattern("blogs:*");

    return Response.SUCCESS({ message: "Blog Status Updated Successfully" });
  } catch (error) {
    logger.error("updateBlogStatus: ", error);
    throw error;
  }
};

exports.updateBlogFeaturedStatus = async ({ id, status }) => {
  try {
    const rawData = await dbObject.getBlogById(id);
    if (!rawData) {
      logger.warn("Blog Not Found");
      return Response.NOT_FOUND({ message: "Blog Not Found" });
    }
    const { affectedRows } = await dbObject.updateBlogFeaturedById({
      id,
      status,
    });

    if (!affectedRows || affectedRows < 1) {
      logger.warn(`Failed to update blog featured status for ID ${id}`);
      return Response.NOT_MODIFIED({});
    }

    // clear cache
    await redisClient.delete(`blogs:${id}`);
    return Response.SUCCESS({
      message: "Blog Featured Status Updated Successfully",
    });
  } catch (error) {
    logger.error("updateBlogFeaturedStatus: ", error);
    throw error;
  }
};

exports.deleteBlog = async (id) => {
  try {
    const rawData = await dbObject.getBlogById(id);
    if (!rawData) {
      logger.warn(`Blog Not Found for ID ${id}`);
      return Response.NOT_FOUND({ message: "Blog Not Found" });
    }
    const { affectedRows } = await dbObject.deleteBlogById(id);

    if (!affectedRows || affectedRows < 1) {
      logger.warn(`Failed to delete blog for ID ${id}`);
      return Response.NOT_MODIFIED({});
    }

    // clear cache
    await redisClient.clearCacheByPattern("blogs:*");
    await redisClient.delete(`blog_public_img:${id}`);
    await redisClient.delete(`blog_private_img:${id}`);
    await redisClient.delete(`blogs:${id}`);
    return Response.SUCCESS({ message: "Blog Deleted Successfully" });
  } catch (error) {
    logger.error("deleteBlog: ", error);
    throw error;
  }
};
