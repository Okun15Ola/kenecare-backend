const router = require("express").Router();
const controller = require("../../../controllers/doctors/daysAvailable.controller");
const validations = require("../../../validations/doctors/days-available.validations");
const { Validate } = require("../../../validations/validate");
const { limiter } = require("../../../utils/rate-limit.utils");
const {
  authenticateUser,
  authorizeDoctor,
} = require("../../../middlewares/auth.middleware");

router.use(authenticateUser, limiter); // Authentication middleware & Rate limiting middleware applied to all routes in this router

router.get("/", authorizeDoctor, controller.GetDoctorAvailableDaysController);
router.get(
  "/:day",
  authorizeDoctor,
  validations.dayOfWeekParamValidation,
  Validate,
  controller.GetDoctorSpecificDayAvailabilityController,
);
router.get(
  "/doctors/:day",
  authorizeDoctor,
  validations.dayOfWeekParamValidation,
  Validate,
  controller.GetDoctorsAvailableOnSpecificDayController,
);
router.post(
  "/multiple",

  validations.createMultipleDaysAvailabilityValidations,
  Validate,
  controller.CreateDoctorAvailableDaysController,
);
router.post(
  "/single",
  authorizeDoctor,
  validations.singleDayAvailabilityValidations,
  Validate,
  controller.CreateDoctorSingleDayAvailabilityController,
);
router.patch(
  "/work-hours",
  authorizeDoctor,
  validations.updateWorkHoursValidations,
  Validate,
  controller.UpdateDoctorWorkHoursController,
);
router.patch(
  "/weekday-hours",
  authorizeDoctor,
  validations.updateMultipleWorkHoursValidations,
  Validate,
  controller.UpdateDoctorMultipleWorkHoursController,
);
router.patch(
  "/availability",
  authorizeDoctor,
  validations.updateDayAvailabilityValidations,
  Validate,
  controller.UpdateDoctorDayAvailabilityController,
);
router.patch(
  "/weekend",
  authorizeDoctor,
  validations.updateWeekendAvailabilityValidations,
  Validate,
  controller.UpdateDoctorWeekendAvailabilityController,
);
router.delete(
  "/:day",
  authorizeDoctor,
  validations.dayOfWeekParamValidation,
  Validate,
  controller.DeleteDoctorSingleDayAvailabilityController,
);
router.delete(
  "/",
  authorizeDoctor,
  controller.DeleteDoctorAllDaysAvailabilityController,
);

module.exports = router;
