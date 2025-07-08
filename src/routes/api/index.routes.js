const router = require("express").Router();
const IndexController = require("../../controllers/index/index.controller");
const { Validate } = require("../../validations/validate");
const { doctorIdValidation } = require("../../validations/index.validations");
const { limiter } = require("../../utils/rate-limit.utils");
const {
  paginationValidation,
} = require("../../validations/pagination.validations");
const {
  calculatePaginationInfo,
} = require("../../middlewares/paginator.middleware");

// router.use(limiter); // Rate limiting middleware applied to all routes in this router

router.get(
  "/blogs",
  limiter,
  paginationValidation,
  Validate,
  calculatePaginationInfo("blogs"),
  IndexController.GetBlogsController,
);
router.get("/blogs/:id", limiter, IndexController.GetBlogByIDController);
router.get(
  "/blog-categories",
  limiter,
  paginationValidation,
  Validate,
  calculatePaginationInfo("blog_categories"),
  IndexController.GetBlogCategoriesController,
);
router.get(
  "/cities",
  limiter,
  paginationValidation,
  Validate,
  calculatePaginationInfo("cities"),
  IndexController.GetCitiesController,
);
router.get(
  "/specialties",
  limiter,
  paginationValidation,
  Validate,
  calculatePaginationInfo("medical_specialities"),
  IndexController.GetSpecialtiesController,
);
router.get(
  "/medical-councils",
  limiter,
  paginationValidation,
  Validate,
  calculatePaginationInfo("medical_councils"),
  IndexController.GetMedicalCouncilsController,
);
router.get(
  "/doctors",
  limiter,
  paginationValidation,
  Validate,
  calculatePaginationInfo("doctors"),
  IndexController.GetDoctorsController,
);
router.get(
  "/doctor/:id",
  limiter,
  doctorIdValidation,
  Validate,
  IndexController.GetDoctorByIDController,
);
router.get(
  "/faqs",
  limiter,
  paginationValidation,
  Validate,
  calculatePaginationInfo("blogs"),
  IndexController.GetFaqsController,
);
router.get(
  "/testimonials",
  limiter,
  paginationValidation,
  Validate,
  calculatePaginationInfo("patients_testimonial"),
  IndexController.GetTestimonialsController,
);
router.get(
  "/common-symptoms",
  limiter,
  paginationValidation,
  Validate,
  calculatePaginationInfo("common_symptoms"),
  IndexController.GetCommonSymptomsController,
);

module.exports = router;
