const router = require("express").Router();
const IndexController = require("../../controllers/index/index.controller");

router.get("/blogs", IndexController.GetBlogsController);
router.get("/blogs/:id", IndexController.GetBlogByIDController);
router.get("/blog-categories", IndexController.GetBlogCategoriesController);
router.get("/cities", IndexController.GetCitiesController);
router.get("/specialties", IndexController.GetSpecialtiesController);
router.get("/medical-councils", IndexController.GetMedicalCouncilsController);
router.get("/doctors", IndexController.GetDoctorsController);
router.get("/faqs", IndexController.GetFaqsController);
router.get("/testimonials", IndexController.GetTestimonialsController);
router.get("/common-symptoms", IndexController.GetCommonSymptomsController);

module.exports = router;
