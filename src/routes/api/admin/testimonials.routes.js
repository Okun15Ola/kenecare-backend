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
const { adminLimiter } = require("../../../utils/rate-limit.utils");
const { authenticateAdmin } = require("../../../middlewares/auth.middleware");

router.use(authenticateAdmin, adminLimiter); // Authentication middleware & Rate limiting middleware applied to all routes in this router

router.get("/", GetTestimonialsController);
router.get("/:id", GetTestimonialByIDController);
router.post("/", CreateTestimonialController);
router.put("/:id", UpdateTestimonialByIdController);
router.patch("/:id/approve", ApproveTestimonialController);
router.patch("/:id/deny", DenyTestimonialController);
router.delete("/:id", DeleteTestimonialByIdController);

module.exports = router;
