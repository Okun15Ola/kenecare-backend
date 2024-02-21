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
        const { appointment_date: aptDate, appointment_status: aptStatus } =
          data;
        const submittedValue = moment(value, "YYYY-MM-DD", true);

        const currentMoment = moment();
        const threeDaysLater = currentMoment.clone().add(3, "days");

        if (!submittedValue.isValid()) {
          throw new Error("Invalid Date format");
        }

        //check if the value is not an old date
        if (currentMoment.isAfter(submittedValue)) {
          throw new Error("Postpone Date must be a future date");
        }

        if (submittedValue.isAfter(threeDaysLater)) {
          throw new Error(
            "Postpone date must not be more than 3 days from today's date"
          );
        }

        return true;
      }),
  ],
  Validate,
  PostponeDoctorAppointmentController
);
router.patch("/:id/start", StartDoctorAppointmentController);

module.exports = router;
