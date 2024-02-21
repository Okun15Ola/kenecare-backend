const router = require("express").Router();
const moment = require("moment");
const { param, body } = require("express-validator");
const { Validate } = require("../../../validations/validate");
const {
  GetDoctorAppointmentsController,
  GetDoctorAppointmentsByIDController,
  CancelDoctorAppointmentController,
  ApproveDoctorAppointmentController,
  PostponeDoctorAppointmentController,
  StartDoctorAppointmentController,
} = require("../../../controllers/doctors/appointments.controller");
const {
  getDoctorAppointmentById,
} = require("../../../db/db.appointments.doctors");
const { getDoctorByUserId } = require("../../../db/db.doctors");
const {
  validateAppointmentPostponedDate,
  validateAppointmentTime,
  validateNewAppointmentDate,
} = require("../../../utils/time.utils");
let data = null;
router.get("/", GetDoctorAppointmentsController);
router.get("/:id", GetDoctorAppointmentsByIDController);

//TODO add data validation rules
router.patch("/:id/approve", ApproveDoctorAppointmentController);
router.patch("/:id/cancel", CancelDoctorAppointmentController);
router.patch(
  "/:id/postpone",
  [
    param("id")
      .notEmpty()
      .withMessage("Appointment ID is required")
      .custom(async (value, { req }) => {
        const { doctor_id: doctorId } = await getDoctorByUserId(req.user.id);

        data = await getDoctorAppointmentById({
          doctorId,
          appointmentId: value,
        });
        if (!data) {
          throw new Error("Specified Appontment Not Found");
        }

        return true;
      }),
    body("postponedDate")
      .notEmpty()
      .withMessage("New Appointment Date is required")
      .custom(async (value, { req }) => {
        const { doctor_id: doctorId } = await getDoctorByUserId(req.user.id);

        if (!data) {
          throw new Error("Specified Appontment Not Found");
        }

        validateNewAppointmentDate({
          date: value,
          time: req.body.postponedTime,
        });

        return true;
      }),

    body("postponedTime")
      .notEmpty()
      .withMessage("Specify new appointment time")
      .custom(async (value, { req }) => {
        validateAppointmentTime(value);
        return true;
      }),
  ],
  Validate,
  PostponeDoctorAppointmentController
);
router.patch("/:id/start", StartDoctorAppointmentController);

module.exports = router;
