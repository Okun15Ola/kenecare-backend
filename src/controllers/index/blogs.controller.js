const logger = require("../../middlewares/logger.middleware");
const {
  getBlogs,
  getBlog,
  createBlog,
  updateBlog,
  updateBlogStatus,
  updateBlogFeaturedStatus,
  deleteBlog,
} = require("../../services/blogs.services");

exports.GetBlogsController = async (req, res, next) => {
  try {
    const response = await getBlogs();
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
exports.GetBlogByIDController = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const response = await getBlog(id);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};