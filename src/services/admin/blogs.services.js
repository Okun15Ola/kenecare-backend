const moment = require("moment");
const dbObject = require("../../db/db.blogs");
const {
  uploadFileToS3Bucket,

  getFileUrlFromS3Bucket,
} = require("../../utils/aws-s3.utils");
const { generateFileName } = require("../../utils/file-upload.utils");
const Response = require("../../utils/response.utils");

exports.getBlogs = async () => {
  try {
    const rawData = await dbObject.getAllBlogs();

    const blogsPromises = rawData.map(
      async ({
        blog_id: blogId,
        category_name: blogCategory,
        title: blogTitle,
        description,
        image,
        tags,
        disclaimer,
        author,
        is_featured: featured,
        is_active: isActive,
        created_at: createdAt,
      }) => {
        const url = await getFileUrlFromS3Bucket(image);
        return {
          blogId,
          blogCategory,
          blogTitle,
          description,
          image: url,
          tags: JSON.parse(tags),
          disclaimer,
          author,
          featured,
          isActive,
          createdAt: moment(createdAt).format("YYYY-MM-DD"),
        };
      },
    );

    const blogs = await Promise.all(blogsPromises);

    return Response.SUCCESS({ data: blogs });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.getBlog = async (id) => {
  try {
    const rawData = await dbObject.getBlogById(id);
    if (!rawData) {
      return Response.NOT_FOUND({ message: "Blog Not Found" });
    }
    const {
      blog_id: blogId,
      category_name: blogCategory,
      title: blogTitle,
      description,
      image,
      tags,
      disclaimer,
      author,
      is_featured: featured,
      is_active: isActive,
      created_at: createdAt,
    } = rawData;

    const url = image ? await getFileUrlFromS3Bucket(image) : null;

    const blog = {
      blogId,
      blogCategory,
      blogTitle,
      description,
      image: url,
      tags: JSON.parse(tags),
      disclaimer,
      author,
      featured,
      isActive,
      createdAt: moment(createdAt).format("YYYY-MM-DD"),
    };

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
