const {
  getBlogCategories,
  getBlogCategoryBy,
  createBlogCategory,
  updateBlogCategory,
  updateBlogCategoryStatus,
} = require("../../services/blog-categories.services");
const logger = require("../../middlewares/logger.middleware");

exports.GetBlogCategoriesController = async (req, res, next) => {
  try {
    const response = await getBlogCategories();
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};

exports.GetBlogCategoryByIDController = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const response = await getBlogCategoryBy(id);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
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
    next(error);
  }
};

exports.UpdateBlogCategoryByIdController = async (req, res, next) => {
  try {
    const { name } = req.body;
    const id = parseInt(req.params.id);
    const response = await updateBlogCategory({ id, name });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
exports.UpdateBlogCategoryStatusController = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const status = parseInt(req.query.status);
    const response = await updateBlogCategoryStatus({ id, status });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};

exports.DeleteBlogCategoryByIdController = async (req, res, next) => {
  try {
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
