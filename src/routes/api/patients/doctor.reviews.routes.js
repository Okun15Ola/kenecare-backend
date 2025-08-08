const router = require("express").Router();
const reviewController = require("../../../controllers/patients/reviews.controller");
const { limiter } = require("../../../utils/rate-limit.utils");
const {
  authenticateUser,
  authorizePatient,
} = require("../../../middlewares/auth.middleware");
const validation = require("../../../validations/reviews.validations");
const { Validate } = require("../../../validations/validate");

router.use(authenticateUser, limiter, authorizePatient);

router.get("/", reviewController.getPatientDoctorsReviewsController);

router.post(
  "/",
  validation.reviewValidation,
  Validate,
  reviewController.addDoctorsReviewsController,
);

module.exports = router;
