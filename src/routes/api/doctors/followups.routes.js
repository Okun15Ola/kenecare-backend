const router = require("express").Router();
const { Validate } = require("../../../validations/validate");
const {
  CreateFollowUpValidation,
  UpdateFollowUpValidation,
  followUpIdValidation,
} = require("../../../validations/doctors/followups.validations");
const {
  CreateAppointmentFollowUpController,
  GetAppointmentFollowUpsController,
  GetFollowUpByIdController,
  UpdateAppointmentFollowUpController,
  DeleteAppointmentFollowUpController,
} = require("../../../controllers/doctors/followups.controller");
const { limiter } = require("../../../utils/rate-limit.utils");
const {
  authenticateUser,
  authorizeDoctor,
} = require("../../../middlewares/auth.middleware");

router.use(authenticateUser, limiter, authorizeDoctor); // Authentication middleware & Rate limiting middleware applied to all routes in this router

router.post(
  "/",
  CreateFollowUpValidation,
  Validate,
  CreateAppointmentFollowUpController,
);
router.put(
  "/:id",
  UpdateFollowUpValidation,
  Validate,
  UpdateAppointmentFollowUpController,
);
router.get("/:id", followUpIdValidation, Validate, GetFollowUpByIdController);
router.get(
  "/appointment/:id",
  followUpIdValidation,
  Validate,
  GetAppointmentFollowUpsController,
);

router.delete(
  "/:id",
  followUpIdValidation,
  Validate,
  DeleteAppointmentFollowUpController,
);
module.exports = router;
