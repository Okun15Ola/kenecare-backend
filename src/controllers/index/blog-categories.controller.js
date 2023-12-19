const {
  getBlogCategories,
  getBlogCategory,

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
    const response = await getBlogCategory(id);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
