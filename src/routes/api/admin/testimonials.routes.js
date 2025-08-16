const router = require("express").Router();
const {
  GetTestimonialsController,
  GetTestimonialByIDController,
  ApproveTestimonialController,
  DenyTestimonialController,
  DeleteTestimonialByIdController,
} = require("../../../controllers/admin/testimonials.controller");
const { adminLimiter } = require("../../../utils/rate-limit.utils");
const { authenticateAdmin } = require("../../../middlewares/auth.middleware");
const {
  paginationValidation,
} = require("../../../validations/pagination.validations");
const { Validate } = require("../../../validations/validate");

router.use(authenticateAdmin, adminLimiter);

router.get("/", paginationValidation, Validate, GetTestimonialsController);
router.get("/:id", GetTestimonialByIDController);
router.patch("/:id/approve", ApproveTestimonialController);
router.patch("/:id/deny", DenyTestimonialController);
router.delete("/:id", DeleteTestimonialByIdController);

module.exports = router;
