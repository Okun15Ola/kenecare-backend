const dbObject = require("../../db/db.blog-categories");
const Response = require("../../utils/response.utils");

exports.getBlogCategories = async () => {
  try {
    const rawData = await dbObject.getAllBlogCategories();
    const categories = rawData.map(
      ({
        category_id: categoryId,
        category_name: categoryName,
        is_active: status,
        inputted_by: inputtedBy,
      }) => ({
        categoryId,
        categoryName,
        status,
        inputtedBy,
      }),
    );

    return Response.SUCCESS({ data: categories });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.getBlogCategory = async (id) => {
  try {
    const rawData = await dbObject.getBlogCategoryById(id);

    if (!rawData) {
      return Response.NOT_FOUND({ message: "Blog Categrory Not Found" });
    }
    const {
      category_id: categoryId,
      category_name: categoryName,
      is_active: status,
      inputted_by: inputtedBy,
    } = rawData;
    const category = {
      categoryId,
      categoryName,
      status,
      inputtedBy,
    };
    return Response.SUCCESS({ data: category });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
exports.createBlogCategory = async (name) => {
  try {
    const rawData = await dbObject.getBlogCategoryByName(name);
    if (rawData) {
      return Response.BAD_REQUEST({
        message: "Blog Category Name Already Exists",
      });
    }

    const category = {
      name,
      inputtedBy: 1,
    };
    await dbObject.createNewBlogCategory(category);
    return Response.SUCCESS({ message: "Blog Category Created Successfully" });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
exports.updateBlogCategory = async ({ id, name }) => {
  try {
    const rawData = await dbObject.getBlogCategoryById(id);
    if (!rawData) {
      return Response.BAD_REQUEST({
        message: "Blog Category Not Found",
      });
    }

    await dbObject.updateBlogCategoryById({ id, name });
    return Response.SUCCESS({ message: "Blog Category Updated Successfully" });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
exports.updateBlogCategoryStatus = async ({ id, status }) => {
  try {
    const rawData = await dbObject.getBlogCategoryById(id);
    if (!rawData) {
      return Response.BAD_REQUEST({
        message: "Blog Category Not Found",
      });
    }
    if (status < 0 || status > 1) {
      return Response.BAD_REQUEST({ message: "Invalid Category Status" });
    }

    await dbObject.updateBlogCategoryStatusById({ id, status });
    return Response.SUCCESS({
      message: "Blog Category Status Updated Successfully",
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
exports.deleteBlogCategory = async (id) => {
  try {
    const rawData = await dbObject.getBlogCategoryById(id);
    if (!rawData) {
      return Response.BAD_REQUEST({
        message: "Blog Category Not Found",
      });
    }

    await dbObject.deleteBlogCategoryById(id);
    return Response.SUCCESS({ message: "Blog Category Deleted Successfully" });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
