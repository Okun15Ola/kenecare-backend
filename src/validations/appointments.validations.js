const { body, param } = require("express-validator");
const moment = require("moment");
const { getSpecialtiyById } = require("../repository/specialities.repository");
const {
  getDoctorById,
  getDoctorByUserId,
} = require("../repository/doctors.repository");
const {
  getDoctorAppointmentById,
} = require("../repository/doctorAppointments.repository");
const {
  validateAppointmentPostponedDate,
  validateAppointmentTime,
  validateDate,
  validateDateTime,
} = require("../utils/time.utils");
const { refineMobileNumber } = require("../utils/auth.utils");

exports.CreateAppointmentValidation = [
  body("patientName")
    .notEmpty()
    .withMessage("Patient Name is required")
    .bail()
    .isString()
    .toUpperCase()
    .trim()
    .escape(),
  body("patientNumber")
    .notEmpty()
    .withMessage("Patient Mobile Number is required")
    .bail()
    .isMobilePhone()
    .withMessage("Invalid Mobile Number")
    .bail()
    .trim()
    .escape()
    .custom(async (patientNumber) => {
      refineMobileNumber(patientNumber);
      return true;
    }),
  body("doctorId")
    .notEmpty()
    .withMessage("Doctor ID is required")
    .isInt({ allow_leading_zeroes: false, gt: 0 })
    .withMessage("Invalid Doctor Id")
    .toInt()
    .escape()
    .custom(async (doctorId) => {
      const data = await getDoctorById(doctorId);
      if (!data) {
        throw new Error("Specified Doctor Not Found");
      }
      return true;
    })
    .bail(),
  body("specialtyId")
    .notEmpty()
    .withMessage("Specialty is required")
    .bail()
    .isInt({ allow_leading_zeroes: false, gt: 0 })
    .withMessage("Invalid Specialty Id")
    .bail()
    .trim()
    .escape()
    .custom(async (id) => {
      const data = await getSpecialtiyById(id);
      if (!data) {
        throw new Error("Specified Specialty Not Found");
      }
      return true;
    })
    .bail(),
  body("symptoms")
    .notEmpty()
    .withMessage("Patient Symptom(s) is required")
    .toLowerCase()
    .trim()
    .escape()
    .bail(),
  body("appointmentType")
    .notEmpty()
    .withMessage("Appointment Type is required")
    .toLowerCase()
    .isIn(["online_consultation", "doctor_visit", "patient_visit"])
    .withMessage("Invalid Appointment Type")
    .trim()
    .bail(),
  body("appointmentDate")
    .notEmpty()
    .withMessage("Appointment Date is required")
    .toLowerCase()
    .trim()
    .escape()
    .custom(async (date) => {
      validateDate(date);
    })
    .bail(),

  body("appointmentTime")
    .notEmpty()
    .withMessage("Appointment Time is required")
    .trim()
    .escape()
    .custom(async (time, { req }) => {
      const date = req.body.appointmentDate;

      validateDateTime({ date, time });
    }),
];

exports.StartAppointmentValidation = [
  param("id")
    .notEmpty()
    .withMessage("Appointment ID is required")
    .bail()
    .escape()
    .trim()
    .custom(async (value, { req }) => {
      const userId = parseInt(req.user.id, 10);
      const doctor = await getDoctorByUserId(userId);
      if (!doctor) {
        throw new Error(
          "UnAuthorized Action. Action can only be performed by a doctor",
        );
      }
      const { doctor_id: doctorId } = doctor;
      const appointment = await getDoctorAppointmentById({
        doctorId,
        appointmentId: value,
      });
      if (!appointment) {
        throw new Error("Appointment Not Found. Please Try Again");
      }
      // Extract patient id from appointment to get patient email
      const {
        appointment_date: appointmentDate,
        // appointment_time: appointmentTime,
        appointment_status: appointmentStatus,
      } = appointment;

      if (appointmentStatus === "pending") {
        throw new Error(
          "Appointment must be approved before starting consultation.",
        );
      }

      if (appointmentStatus === "completed") {
        throw new Error(
          "Cannot start an appointment that has already been completed",
        );
      }

      // Check if the date is not an old date
      const today = moment().format("YYYY-MM-DD");
      const appointmentMoment = moment(appointmentDate, "YYYY-MM-DD", true);

      if (appointmentMoment.isBefore(today)) {
        throw new Error(
          "Appointment Date is overdue. Please postpone to an earlier date before starting",
        );
      }

      if (appointmentMoment.isAfter(today)) {
        throw new Error(
          "Cannot Start an appointment before the scheduled date",
        );
      }

      return true;
    }),
];
exports.ApproveAppointmentValidation = [
  param("id")
    .notEmpty()
    .withMessage("Appointment ID is required")
    .escape()
    .trim()
    .custom(async (value, { req }) => {
      const userId = parseInt(req.user.id, 10);
      const doctor = await getDoctorByUserId(userId);
      if (!doctor) {
        throw new Error(
          "UnAuthorized Action. Action can only be performed by a doctor",
        );
      }
      const { doctor_id: doctorId } = doctor;
      const appointment = await getDoctorAppointmentById({
        doctorId,
        appointmentId: value,
      });
      if (!appointment) {
        throw new Error("Appointment Not Found. Please Try Again");
      }
      // Extract patient id from appointment to get patient email
      const {
        appointment_date: appointmentDate,
        appointment_status: appointmentStatus,
      } = appointment;

      if (appointmentStatus === "completed") {
        throw new Error(
          "Cannot start an appointment that has already been completed",
        );
      }

      // Check if the date is not an old date
      const today = moment().format("YYYY-MM-DD");
      const appointmentMoment = moment(appointmentDate, "YYYY-MM-DD", true);

      if (appointmentMoment.isBefore(today)) {
        throw new Error(
          "Appointment Date is overdue. Please postpone to an earlier date before starting",
        );
      }

      return true;
    }),
];

exports.PostponeAppointmentValidation = [
  param("id")
    .notEmpty()
    .withMessage("Appointment ID is required")
    .custom(async (value, { req }) => {
      const { doctor_id: doctorId } = await getDoctorByUserId(req.user.id);

      const data = await getDoctorAppointmentById({
        doctorId,
        appointmentId: value,
      });

      if (!data) {
        throw new Error("Appointment Not Found");
      }

      return true;
    }),
  body("postponedDate")
    .notEmpty()
    .withMessage("New Appointment Date is required")
    .bail()
    .custom(async (value) => {
      const error = validateAppointmentPostponedDate(value);
      if (error) {
        throw new Error(error);
      }

      return true;
    }),

  body("postponedTime")
    .notEmpty()
    .withMessage("Specify new appointment time")
    .bail()
    .custom(async (value) => {
      const error = validateAppointmentTime(value);
      if (error) {
        throw new Error(error);
      }
      return true;
    }),
];
