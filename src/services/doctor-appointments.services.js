const dbObject = require("../db/db.appointments");
const Response = require("../utils/response.utils");
exports.getPatientAppointments = async () => {
  try {
    const rawData = await dbObject.getAllBlogs();

    const blogs = rawData.map(
      ({
        blog_id: blogId,
        blog_category_id: blogCategory,
        title: blogTitle,
        description,
        image,
        tags,
        inputted_by: author,
        is_featured: featured,
        is_active: isActive,
      }) => {
        return {
          blogId,
          blogCategory,
          blogTitle,
          description,
          image,
          tags:JSON.parse(tags),
          author,
          featured,
          isActive,
        };
      }
    );

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
      blog_category_id: blogCategory,
      title: blogTitle,
      description,
      image,
      tags,
      inputted_by: author,
      is_featured: featured,
      is_active: isActive,
    } = rawData;

    const blog = {
      blogId,
      blogCategory,
      blogTitle,
      description,
      image,
      tags:JSON.parse(tags),
      author,
      featured,
      isActive,
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
  image,
  tags,
  featured,
  inputtedBy,
}) => {
  try {
    

    await dbObject.createNewBlog({
      category,
      title,
      content,
      image,
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
exports.updateBlog = async ({ id, blog }) => {
  try {
    const result = await isBlogExist(id);

    if (!result) {
      return Response.NOT_FOUND({ message: "Blog Not Found" });
    }
    await dbObject.updateBlogById({ id, blog });
    return Response.SUCCESS({ message: "Blog Updated Succcessfully" });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
exports.updateBlogStatus = async ({ id, status }) => {
  try {
    const result = await isBlogExist(id);
    if (!result) {
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
    const result = await isBlogExist(id);
    if (!result) {
      return Response.NOT_FOUND({ message: "Blog Not Found" });
    }
    await dbObject.updateBlogFeaturedById({ id, status });
    return Response.SUCCESS({ message: "Blog Featured Status Updated Successfully" });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
exports.deleteBlog = async (id) => {
  try {
    const result = await isBlogExist(id);
   if (!result) {
      return Response.NOT_FOUND({ message: "Blog Not Found" });
    }
    await dbObject.deleteBlogById(id);
      return Response.SUCCESS({ message: "Blog Deleted Successfully" });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const isBlogExist = async (id) => {
  const rawData = await dbObject.getBlogById(id);
  return !(!rawData) 
};
