const router = require("express").Router();
const doctorReviewsController = require("../../../controllers/admin/doctors.reviews.controller");
const { adminLimiter } = require("../../../utils/rate-limit.utils");
const { authenticateAdmin } = require("../../../middlewares/auth.middleware");
const {
  paginationValidation,
} = require("../../../validations/pagination.validations");
const { Validate } = require("../../../validations/validate");
const validation = require("../../../validations/reviews.validations");

router.use(authenticateAdmin, adminLimiter);

router.get(
  "/",
  paginationValidation,
  Validate,
  doctorReviewsController.getDoctorsReviewsController,
);

router.get("/:id", doctorReviewsController.getDoctorsReviewByIdController);

router.patch(
  "/:id/approve",
  validation.reviewIdValidation,
  Validate,
  doctorReviewsController.approveDoctorReviewController,
);

router.patch(
  "/:id/reject",
  validation.reviewIdValidation,
  Validate,
  doctorReviewsController.rejectDoctorReviewController,
);

module.exports = router;
