const router = require("express").Router();
const IndexController = require("../../controllers/index/index.controller");
const { Validate } = require("../../validations/validate");
const {
  doctorIdValidation,
  doctorPaginationValidation,
} = require("../../validations/index.validations");
const { limiter } = require("../../utils/rate-limit.utils");
const {
  paginationValidation,
} = require("../../validations/pagination.validations");
const { authenticateUser } = require("../../middlewares/auth.middleware");
const cache = require("../../middlewares/cache.middlewares");

router.get(
  "/doctor-health-blogs/:id",
  limiter,
  doctorIdValidation,
  Validate,
  IndexController.GetDoctorBlogsController,
);

router.get(
  "/doctor-faqs/:id",
  limiter,
  [...doctorIdValidation, ...paginationValidation],
  Validate,
  IndexController.GetDoctorFaqController,
);

router.get(
  "/blogs",
  cache(600),
  limiter,
  paginationValidation,
  Validate,
  IndexController.GetBlogsController,
);
router.get(
  "/blogs/:id",
  cache(60),
  limiter,
  IndexController.GetBlogByIDController,
);
router.get(
  "/blog-categories",
  cache(60),
  limiter,
  paginationValidation,
  Validate,
  IndexController.GetBlogCategoriesController,
);
router.get(
  "/cities",
  cache(600),
  limiter,
  paginationValidation,
  Validate,
  IndexController.GetCitiesController,
);
router.get(
  "/specialties",
  cache(60),
  limiter,
  paginationValidation,
  Validate,
  IndexController.GetSpecialtiesController,
);
router.get(
  "/medical-councils",
  cache(600),
  limiter,
  paginationValidation,
  Validate,
  IndexController.GetMedicalCouncilsController,
);

router.get(
  "/doctors",
  limiter,
  doctorPaginationValidation,
  Validate,
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
  IndexController.GetFaqsController,
);
router.get(
  "/testimonials",
  limiter,
  paginationValidation,
  Validate,
  IndexController.GetTestimonialsController,
);
router.get(
  "/common-symptoms",
  cache(600),
  limiter,
  paginationValidation,
  Validate,
  IndexController.GetCommonSymptomsController,
);
router.get(
  "/features/:name/available",
  authenticateUser,
  limiter,
  IndexController.CheckUserFeatureController,
);

module.exports = router;
