const router = require("express").Router();
const IndexController = require("../../controllers/index/index.controller");
const { getDoctorById } = require("../../db/db.doctors");
const { Validate } = require("../../validations/validate");
const { body, param, check } = require("express-validator");

router.get("/blogs", IndexController.GetBlogsController);
router.get("/blogs/:id", IndexController.GetBlogByIDController);
router.get("/blog-categories", IndexController.GetBlogCategoriesController);
router.get("/cities", IndexController.GetCitiesController);
router.get("/specialties", IndexController.GetSpecialtiesController);
router.get("/medical-councils", IndexController.GetMedicalCouncilsController);
router.get("/doctors", IndexController.GetDoctorsController);
router.get(
  "/doctor/:id",
  [
    param("id")
      .notEmpty()
      .withMessage("Specify Doctor Id")
      .escape()
      .trim()
      .custom(async (value) => {
        const id = parseInt(value, 10);

        const isValidNumber = Number.isSafeInteger(id);
        if (!isValidNumber) {
          throw new Error("Please provide a valid ID");
        }
        const doctorId = Number(id);
        const data = await getDoctorById(doctorId);
        if (!data) {
          throw new Error("Doctor Not Found");
        }
        return true;
      }),
  ],
  Validate,
  IndexController.GetDoctorByIDController
);
router.get("/faqs", IndexController.GetFaqsController);
router.get("/testimonials", IndexController.GetTestimonialsController);
router.get("/common-symptoms", IndexController.GetCommonSymptomsController);

module.exports = router;
