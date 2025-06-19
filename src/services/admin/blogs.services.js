const dbObject = require("../../repository/blogs.repository");
const { uploadFileToS3Bucket } = require("../../utils/aws-s3.utils");
const { generateFileName } = require("../../utils/file-upload.utils");
const Response = require("../../utils/response.utils");
const redisClient = require("../../config/redis.config");
const { mapBlogRow } = require("../../utils/db-mapper.utils");

exports.getBlogs = async () => {
  try {
    const cacheKey = "blogs:all";
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }
    const rawData = await dbObject.getAllBlogs();

    if (!rawData) {
      return Response.NOT_FOUND({ message: "Blogs Not Found" });
    }

    const blogs = await Promise.all(rawData.map(mapBlogRow));

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(blogs),
    });

    return Response.SUCCESS({ data: blogs });
  } catch (error) {
    console.error(error);
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
      return Response.NOT_FOUND({ message: "Blog Not Found" });
    }
    const blog = await mapBlogRow(rawData);

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(blog),
    });
    return Response.SUCCESS({ data: blog });
  } catch (error) {
    console.error(error);
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
      return Response.BAD_REQUEST({ message: "Please upload a blog image" });
    }

    const fileName = generateFileName(file);

    const { $metadata } = await uploadFileToS3Bucket({
      fileName,
      buffer: file.buffer,
      mimetype: file.mimetype,
    });
    if ($metadata.httpStatusCode !== 200) {
      return Response.INTERNAL_SERVER_ERROR({
        message: "Error Creating New Blog. Please try again",
      });
    }

    await dbObject.createNewBlog({
      category,
      title,
      content,
      image: fileName,
      tags,
      featured,
      inputtedBy,
    });
    return Response.CREATED({ message: "Blog Created Successfully" });
  } catch (error) {
    console.error(error);
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

    await dbObject.updateBlogById({
      id,
      category,
      title,
      content,
      tags,
      file: fileName,
      featured,
    });
    return Response.SUCCESS({ message: "Blog Updated Succcessfully" });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
exports.updateBlogStatus = async ({ id, status }) => {
  try {
    const rawData = await dbObject.getBlogById(id);
    if (!rawData) {
      return Response.NOT_FOUND({ message: "Blog Not Found" });
    }
    await dbObject.updateBlogStatusById({ id, status });
    return Response.SUCCESS({ message: "Blog Status Updated Successfully" });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
exports.updateBlogFeaturedStatus = async ({ id, status }) => {
  try {
    const rawData = await dbObject.getBlogById(id);
    if (!rawData) {
      return Response.NOT_FOUND({ message: "Blog Not Found" });
    }
    await dbObject.updateBlogFeaturedById({ id, status });
    return Response.SUCCESS({
      message: "Blog Featured Status Updated Successfully",
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
exports.deleteBlog = async (id) => {
  try {
    const rawData = await dbObject.getBlogById(id);
    if (!rawData) {
      return Response.NOT_FOUND({ message: "Blog Not Found" });
    }
    await dbObject.deleteBlogById(id);
    return Response.SUCCESS({ message: "Blog Deleted Successfully" });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
