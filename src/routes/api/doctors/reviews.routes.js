const router = require("express").Router();
const controller = require("../../../controllers/doctors/reviews.controller");
const { limiter } = require("../../../utils/rate-limit.utils");
const {
  authenticateUser,
  authorizeDoctor,
} = require("../../../middlewares/auth.middleware");

router.use(authenticateUser, limiter, authorizeDoctor);

router.get("/", controller.getDoctorApprovedReviewsController);

module.exports = router;
