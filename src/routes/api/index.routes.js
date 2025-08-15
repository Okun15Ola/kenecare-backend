const router = require("express").Router();
const IndexController = require("../../controllers/index/index.controller");
const { Validate } = require("../../validations/validate");
const {
  doctorIdValidation,
  doctorPaginationValidation,
  // patientTestimonialValidation,
} = require("../../validations/index.validations");
const { limiter } = require("../../utils/rate-limit.utils");
const {
  paginationValidation,
} = require("../../validations/pagination.validations");
// const {
//   authenticateUser,
//   authorizePatient,
// } = require("../../middlewares/auth.middleware");

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
  limiter,
  paginationValidation,
  Validate,
  IndexController.GetBlogsController,
);
router.get("/blogs/:id", limiter, IndexController.GetBlogByIDController);
router.get(
  "/blog-categories",
  limiter,
  paginationValidation,
  Validate,
  IndexController.GetBlogCategoriesController,
);
router.get(
  "/cities",
  limiter,
  paginationValidation,
  Validate,
  IndexController.GetCitiesController,
);
router.get(
  "/specialties",
  limiter,
  paginationValidation,
  Validate,
  IndexController.GetSpecialtiesController,
);
router.get(
  "/medical-councils",
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
// router.post(
//   "/testimonials",
//   authenticateUser,
//   authorizePatient,
//   limiter,
//   patientTestimonialValidation,
//   Validate,
//   IndexController.CreatePatientTestimonialController,
// );
router.get(
  "/common-symptoms",
  limiter,
  paginationValidation,
  Validate,
  IndexController.GetCommonSymptomsController,
);

module.exports = router;
