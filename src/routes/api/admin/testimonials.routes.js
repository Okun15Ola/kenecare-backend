const router = require("express").Router();
const {
  GetTestimonialsController,
  GetTestimonialByIDController,
  CreateTestimonialController,
  UpdateTestimonialByIdController,
  ApproveTestimonialController,
  DenyTestimonialController,
  DeleteTestimonialByIdController,
} = require("../../../controllers/admin/testimonials.controller");

router.get("/", GetTestimonialsController);
router.get("/:id", GetTestimonialByIDController);
router.post("/", CreateTestimonialController);
router.put("/:id", UpdateTestimonialByIdController);
router.patch("/:id/approve", ApproveTestimonialController);
router.patch("/:id/deny", DenyTestimonialController);
router.delete("/:id", DeleteTestimonialByIdController);

module.exports = router;
