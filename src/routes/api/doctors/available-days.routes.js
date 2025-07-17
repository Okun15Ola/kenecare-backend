const router = require("express").Router();
const controller = require("../../../controllers/doctors/daysAvailable.controller");
const validations = require("../../../validations/doctors/days-available.validations");
const { Validate } = require("../../../validations/validate");
const { limiter } = require("../../../utils/rate-limit.utils");
const {
  authenticateUser,
  authorizeDoctor,
} = require("../../../middlewares/auth.middleware");

router.use(authenticateUser, limiter, authorizeDoctor); // Authentication middleware & Rate limiting middleware applied to all routes in this router

router.get("/", controller.GetDoctorAvailableDaysController);
router.get(
  "/:day",
  validations.dayOfWeekParamValidation,
  Validate,
  controller.GetDoctorSpecificDayAvailabilityController,
);
router.get(
  "/doctors/:day",
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
  validations.singleDayAvailabilityValidations,
  Validate,
  controller.CreateDoctorSingleDayAvailabilityController,
);
router.patch(
  "/work-hours",
  validations.updateWorkHoursValidations,
  Validate,
  controller.UpdateDoctorWorkHoursController,
);
router.patch(
  "/weekday-hours",
  validations.updateMultipleWorkHoursValidations,
  Validate,
  controller.UpdateDoctorMultipleWorkHoursController,
);
router.patch(
  "/availability",
  validations.updateDayAvailabilityValidations,
  Validate,
  controller.UpdateDoctorDayAvailabilityController,
);
router.patch(
  "/weekend",
  validations.updateWeekendAvailabilityValidations,
  Validate,
  controller.UpdateDoctorWeekendAvailabilityController,
);
router.delete(
  "/:day",
  validations.dayOfWeekParamValidation,
  Validate,
  controller.DeleteDoctorSingleDayAvailabilityController,
);
router.delete("/", controller.DeleteDoctorAllDaysAvailabilityController);

module.exports = router;
