const router = require("express").Router();
const {
  GetPatientFollowUpMetricsController,
} = require("../../../controllers/patients/appointments.controller");
const { limiter } = require("../../../utils/rate-limit.utils");
const {
  authenticateUser,
  authorizePatient,
} = require("../../../middlewares/auth.middleware");

router.use(authenticateUser, limiter, authorizePatient); // Authentication middleware & Rate limiting middleware applied to all routes in this router

router.get("/metrics", GetPatientFollowUpMetricsController);

module.exports = router;
