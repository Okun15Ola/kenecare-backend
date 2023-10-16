const router = require("express").Router();
const {
  GetTestimonialsController,
  GetTestimonialByIDController,
  CreateTestimonialController,
  UpdateTestimonialByIdController,
  UpdateTestimonialStatusController,
  DeleteTestimonialByIdController,
} = require("../../../controllers/admin/testimonials.controller");

router.get("/", GetTestimonialsController);
router.post("/:id", GetTestimonialByIDController);
router.post("/", CreateTestimonialController);
router.put("/:id", UpdateTestimonialByIdController);
router.patch("/:id/:status", UpdateTestimonialStatusController);
router.delete("/:id", DeleteTestimonialByIdController);
