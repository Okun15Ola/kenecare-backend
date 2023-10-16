const dbObject = require("../db/db.blogs");
const logger = require("../middlewares/logger.middleware");

exports.getAllBlogs = async () => {
  try {
    const data = await dbObject.getAllBlogs();
    console.log(data);

    return [{}];
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

exports.getBlogById = async (id) => {
  try {
    const blogId = parseInt(id);
    const data = await dbObject.getBlogById(blogId);
    console.log(data);

    return {};
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
exports.createNewBlog = async (id) => {
  try {
    const blogId = parseInt(id);
    const data = await dbObject.getBlogById(blogId);
    console.log(data);

    return {};
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
