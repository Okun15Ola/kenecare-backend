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
exports.CreateBlogController = async (req, res, next) => {
  try {
    const file = req.file || null;
    const userId = parseInt(req.user.id);

    if (file) {
      const { category, title, content, featured } = req.body;
      const tags = JSON.stringify(req.body.tags);
      const response = await createBlog({
        category,
        title,
        content,
        file,
        tags,
        featured,
        inputtedBy: userId,
      });
      return res.status(response.statusCode).json(response);
    }
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};

exports.UpdateBlogByIdController = async (req, res, next) => {
  try {
    const file = req.file || null;
    const id = parseInt(req.params.id);
    const { category, title, content, featured } = req.body;
    const tags = JSON.stringify(req.body.tags);

    const response = await updateBlog({
      id,
      category,
      title,
      content,
      tags,
      file,
      featured,
    });

    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
exports.UpdateBlogStatusController = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    const status = parseInt(req.query.status);
    const response = await updateBlogStatus({ id, status });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};

exports.DeleteBlogByIdController = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    const response = await deleteBlog(id);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
