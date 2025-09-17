const {
  getBlogCategories,
  getBlogCategory,
  createBlogCategory,
  updateBlogCategory,
  updateBlogCategoryStatus,
} = require("../../services/admin/blog-categories.services");
const logger = require("../../middlewares/logger.middleware");
const { deleteBlog } = require("../../services/admin/blogs.services");

exports.GetBlogCategoriesController = async (req, res, next) => {
  try {
    const { limit, page } = req.query;
    const response = await getBlogCategories(limit, page);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

exports.GetBlogCategoryByIDController = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const response = await getBlogCategory(id);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};
exports.CreateBlogCategoryController = async (req, res, next) => {
  try {
    const { name } = req.body;
    const response = await createBlogCategory(name);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

exports.UpdateBlogCategoryByIdController = async (req, res, next) => {
  try {
    const { name } = req.body;
    const id = parseInt(req.params.id, 10);
    const response = await updateBlogCategory({ id, name });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};
exports.UpdateBlogCategoryStatusController = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const status = parseInt(req.query.status, 10);
    const response = await updateBlogCategoryStatus({ id, status });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

exports.DeleteBlogCategoryByIdController = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const response = await deleteBlog(id);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};
