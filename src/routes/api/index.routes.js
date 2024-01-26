const router = require("express").Router();
const logger = require("../../middlewares/logger.middleware");
const {
  GetBlogsController,
  GetBlogByIDController,
} = require("../../controllers/index/blogs.controller");

const {
  GetSpecialtiesController,
} = require("../../controllers/index/specialties.controller");
const {
  GetDoctorsController,
} = require("../../controllers/index/doctors.controller");
const {
  GetCitiesController,
} = require("../../controllers/index/cities.controller");
const {
  GetCommonSymptomsController,
} = require("../../controllers/index/common-symptoms.controller");
const {
  GetMedicalCouncilsController,
} = require("../../controllers/index/medical-council.controller");

router.get("/blogs", GetBlogsController);
router.get("/blogs/:id", GetBlogByIDController);
router.get("/blog-categories", (req, res, next) => {
  try {
    return res.end();
  } catch (error) {}
});
router.get("/cities", GetCitiesController);
router.get("/specialties", GetSpecialtiesController);
router.get("/medical-councils", GetMedicalCouncilsController);
router.get("/doctors", GetDoctorsController);
router.get("/faqs", (req, res, next) => {
  try {
    console.log("FAQ's");
    return res.end();
  } catch (error) {}
});
router.get("/testimonials", (req, res, next) => {
  try {
    console.log("Testimonials");
    return res.end();
  } catch (error) {}
});
router.get("/common-symptoms", GetCommonSymptomsController);

module.exports = router;
