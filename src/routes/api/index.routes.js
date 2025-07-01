const router = require("express").Router();
const IndexController = require("../../controllers/index/index.controller");
const { Validate } = require("../../validations/validate");
const { doctorIdValidation } = require("../../validations/index.validations");
const { limiter } = require("../../utils/rate-limit.utils");

router.use(limiter); // Rate limiting middleware applied to all routes in this router

router.get("/blogs", IndexController.GetBlogsController);
router.get("/blogs/:id", IndexController.GetBlogByIDController);
router.get("/blog-categories", IndexController.GetBlogCategoriesController);
router.get("/cities", IndexController.GetCitiesController);
router.get("/specialties", IndexController.GetSpecialtiesController);
router.get("/medical-councils", IndexController.GetMedicalCouncilsController);
router.get("/doctors", IndexController.GetDoctorsController);
router.get(
  "/doctor/:id",
  doctorIdValidation,
  Validate,
  IndexController.GetDoctorByIDController,
);
router.get("/faqs", IndexController.GetFaqsController);
router.get("/testimonials", IndexController.GetTestimonialsController);
router.get("/common-symptoms", IndexController.GetCommonSymptomsController);

module.exports = router;
