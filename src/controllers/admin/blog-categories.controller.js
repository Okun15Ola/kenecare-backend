const {
  getBlogCategories,
  getBlogCategory,
  createBlogCategory,
  updateBlogCategory,
  updateBlogCategoryStatus,
} = require("../../services/blog-categories.services");
const logger = require("../../middlewares/logger.middleware");
const { deleteBlog } = require("../../services/blogs.services");

exports.GetBlogCategoriesController = async (req, res, next) => {
  try {
    const response = await getBlogCategories();
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
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
    console.error(error);
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
    console.error(error);
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
    console.error(error);
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
    console.error(error);
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
    console.error(error);
    logger.error(error);
    return next(error);
  }
};
