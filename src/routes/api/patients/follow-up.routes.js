const router = require("express").Router();
const {
  GetPatientFollowUpMetricsController,
} = require("../../../controllers/patients/appointments.controller");
const {
  getPatientAppointmentFollowUpController,
} = require("../../../controllers/patients/follow-up.controller");
const {
  AppointmentIdValidation,
} = require("../../../validations/appointments.validations");
const { Validate } = require("../../../validations/validate");
const { limiter } = require("../../../utils/rate-limit.utils");
const {
  authenticateUser,
  authorizePatient,
} = require("../../../middlewares/auth.middleware");

router.use(authenticateUser, limiter, authorizePatient);

router.get("/metrics", GetPatientFollowUpMetricsController);

router.get(
  "/appointments/:id",
  AppointmentIdValidation,
  Validate,
  getPatientAppointmentFollowUpController,
);

module.exports = router;
