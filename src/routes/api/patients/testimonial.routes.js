const router = require("express").Router();
const testimonialController = require("../../../controllers/patients/testimonial.controller");
const { Validate } = require("../../../validations/validate");
const {
  patientTestimonialValidation,
} = require("../../../validations/index.validations");
const { limiter } = require("../../../utils/rate-limit.utils");
const {
  authenticateUser,
  authorizePatient,
} = require("../../../middlewares/auth.middleware");

router.post(
  "/",
  authenticateUser,
  authorizePatient,
  limiter,
  patientTestimonialValidation,
  Validate,
  testimonialController.CreatePatientTestimonialController,
);

router.get(
  "/my-testimonial",
  authenticateUser,
  authorizePatient,
  limiter,
  testimonialController.GetPatientTestimonialController,
);

module.exports = router;
