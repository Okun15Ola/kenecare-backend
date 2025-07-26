const router = require("express").Router();
const controller = require("../../../controllers/doctors/time-slot.controller");
const { limiter } = require("../../../utils/rate-limit.utils");
const {
  authenticateUser,
  authorizeDoctor,
} = require("../../../middlewares/auth.middleware");
const { Validate } = require("../../../validations/validate");
const {
  dayParamValidation,
  validateSlotIdParam,
} = require("../../../validations/doctors/time-slot.validations");

router.use(authenticateUser, limiter, authorizeDoctor);

router.get("/week", controller.getDoctorWeekSlotsController);

router.get("/booked", controller.getDoctorBookedSlotsController);

router.get(
  "/:day/day",
  dayParamValidation,
  Validate,
  controller.getDoctorAvailableDaySlotsController,
);

// router.post("/", controller.createSlotController);

// router.post(
//   "/multiple-time-slots",
//   controller.createMultipleTimeSlotsSlotsController,
// );

// router.patch("/update", controller.updateSlotTimingController);

router.patch(
  "/:slotId/available",
  validateSlotIdParam,
  Validate,
  controller.markSlotAvailableController,
);

router.patch(
  "/:slotId/unavailable",
  validateSlotIdParam,
  Validate,
  controller.markSlotUnvailableController,
);

router.patch(
  "/day/:day/unavailable",
  dayParamValidation,
  Validate,
  controller.markDaySlotUnavailableController,
);

router.delete("/week", controller.deleteDoctorWeekSlotsController);

router.delete(
  "/day/:day",
  dayParamValidation,
  Validate,
  controller.deleteDaySlotsController,
);

router.delete(
  "/:id",
  validateSlotIdParam,
  Validate,
  controller.deleteSlotByIdController,
);

module.exports = router;
