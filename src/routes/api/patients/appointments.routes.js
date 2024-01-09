const router = require("express").Router();
const {
  GetAppointmentsController,
  GetAppointmentsByIDController,
  CreateAppointmentController,
} = require("../../../controllers/patients/appointments.controller");
const {
  CreateAppointmentValidation,
} = require("../../../validations/appointments.validations");
const { Validate } = require("../../../validations/validate");

router.get("/", GetAppointmentsController);
router.get("/:id", GetAppointmentsByIDController);

router.post(
  "/",
  CreateAppointmentValidation,
  Validate,
  CreateAppointmentController
);
router.put("/:id", (req, res, next) => {
  try {
    console.log("Update patient's appointment");
  } catch (error) {
    console.error(error);
  }
});
router.patch("/:id/date", (req, res, next) => {
  try {
    console.log("Update patient's appointment date");
  } catch (error) {
    console.error(error);
  }
});
router.patch("/:id/status", (req, res, next) => {
  try {
    console.log("Update patient's appointment status");
  } catch (error) {
    console.error(error);
  }
});
router.delete("/:id", (req, res, next) => {
  try {
    console.log("Delete patient's appointment");
  } catch (error) {
    console.error(error);
  }
});

module.exports = router;
