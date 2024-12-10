const router = require("express").Router();
const { param } = require("express-validator");
const { Validate } = require("../../../validations/validate");
const {
  CreateFollowUpValidation,
  UpdateFollowUpValidation,
} = require("../../../validations/followups.validations");
const {
  CreateAppointmentFollowUpController,

  GetAppointmentFollowUpsController,
  GetFollowUpByIdController,
  UpdateAppointmentFollowUpController,
  DeleteAppointmentFollowUpController,
} = require("../../../controllers/doctors/followups.controller");

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
router.get(
  "/:id",
  [
    param("id")
      .notEmpty()
      .withMessage("Followup ID is required")
      .isInt({ allow_leading_zeroes: false, gt: 0 })
      .withMessage("Provide a valid Followup ID")
      .escape(),
  ],
  Validate,
  GetFollowUpByIdController,
);
router.get(
  "/appointment/:id",
  [
    param("id")
      .notEmpty()
      .withMessage("Appointment ID is required")
      .isInt({ allow_leading_zeroes: false, gt: 0 })
      .withMessage("Provide a valid Appointment ID")
      .escape(),
  ],
  Validate,
  GetAppointmentFollowUpsController,
);

router.delete(
  "/:id",
  [
    param("id")
      .notEmpty()
      .withMessage("Followup ID is required")
      .isInt({ allow_leading_zeroes: false, gt: 0 })
      .withMessage("Provide a valid Followup ID")
      .escape(),
  ],
  Validate,
  DeleteAppointmentFollowUpController,
);
module.exports = router;
