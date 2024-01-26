const logger = require("../../middlewares/logger.middleware");
const {
  getAllPatients,
  getPatientById,
  getPatientsTestimonial,
} = require("../../services/patients.services");

exports.GetPatientsController = async (req, res, next) => {
  try {
    const response = await getAllPatients();
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
exports.GetPatientByIdController = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const response = await getPatientById(id);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
exports.GetPatientTestimonialsController = async (req, res, next) => {
  try {
    const response = await getPatientsTestimonial();
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};

exports.CreateBlogController = async (req, res, next) => {
  try {
    //TODO to be changed by actual image file
    const image = "https://example.com/pic.jpg";
    const { category, title, content, featured } = req.body;
    const tags = JSON.stringify(req.body.tags);
    const response = await createBlog({
      category,
      title,
      content,
      image,
      tags,
      featured,
      inputtedBy: 1,
    });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};

exports.UpdateBlogByIdController = async (req, res, next) => {
  try {
    const image = "https://example.com/pic.jpg";
    const id = parseInt(req.params.id);
    const { category, title, content, featured } = req.body;
    const tags = JSON.stringify(req.body.tags);
    const blog = { category, title, content, tags, image, featured };
    const response = await updateBlog({ id, blog });
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
