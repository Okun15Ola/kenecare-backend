const logger = require("../../middlewares/logger.middleware");
const doctorBlogService = require("../../services/doctors/doctor.health-blogs.services");

exports.GetDoctorBlogsController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id, 10);
    const response = await doctorBlogService.getBlogsByDoctorService(userId);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

exports.GetDoctorPublishedBlogsController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id, 10);
    const response =
      await doctorBlogService.getPublishedBlogsByDoctorService(userId);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

exports.GetDoctorBlogController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id, 10);
    const { blogUuid } = req.params;
    const response = await doctorBlogService.getBlogsByUuidService(
      userId,
      blogUuid,
    );
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

exports.CreateDoctorBlogController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id, 10);
    const { title, content, status, tags, publishedAt } = req.body;
    const formattedTags = Array.isArray(tags) ? JSON.stringify(tags) : null;
    const imageFile = req.file;
    const response = await doctorBlogService.createDoctorBlogService({
      userId,
      title,
      content,
      image: imageFile,
      tags: formattedTags,
      status,
      publishedAt,
    });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

exports.UpdateDoctorBlogController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id, 10);
    const { blogUuid } = req.params;
    const { title, content, status, tags, publishedAt } = req.body;
    const formattedTags = Array.isArray(tags) ? JSON.stringify(tags) : null;
    const imageFile = req.file;
    const response = await doctorBlogService.updateDoctorBlogService({
      userId,
      blogUuid,
      title,
      content,
      image: imageFile,
      tags: formattedTags,
      status,
      publishedAt,
    });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

exports.UpdateDoctorBlogStatusController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id, 10);
    const { status } = req.body;
    const { blogUuid } = req.params;
    const response = await doctorBlogService.updateDoctorBlogStatusService({
      status,
      userId,
      blogUuid,
    });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

exports.DeleteDoctorBlogController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id, 10);
    const { blogUuid } = req.params;
    const response = await doctorBlogService.deleteDoctorBlogService(
      userId,
      blogUuid,
    );
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};
