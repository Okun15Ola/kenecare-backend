const { body, param } = require("express-validator");
const moment = require("moment");
const {
  getSpecialtyByName,
  getSpecialtiyById,
} = require("../db/db.specialities");
const { getDoctorById, getDoctorByUserId } = require("../db/db.doctors");
const { getDoctorAppointmentById } = require("../db/db.appointments.doctors");
const {
  validateAppointmentPostponedDate,
  validateAppointmentTime,
} = require("../utils/time.utils");

exports.CreateAppointmentValidation = [
  body("patientName")
    .notEmpty()
    .withMessage("Patient Name is required")
    .toLowerCase()
    .trim()
    .escape()
    .custom(async (name) => {
      const data = await getSpecialtyByName(name);
      if (data) {
        throw new Error("Specified Specialty Name Already Exists");
      }
      return true;
    }),
  body("patientNumber")
    .notEmpty()
    .withMessage("Patient Mobile Number is required")
    .toLowerCase()
    .trim()
    .escape(),
  body("doctorId")
    .notEmpty()
    .withMessage("Doctor ID is required")
    .toLowerCase()
    .trim()
    .escape()
    .custom(async (doctorId) => {
      const data = await getDoctorById(doctorId);
      if (!data) {
        throw new Error("Doctor Not Found");
      }
      return true;
    }),
  body("specialtyId")
    .notEmpty()
    .withMessage("Specialty is required")
    .toLowerCase()
    .trim()
    .escape()
    .custom(async (id) => {
      const data = await getSpecialtiyById(id);
      if (!data) {
        throw new Error("Specialty Not Found");
      }
      return true;
    }),
  body("symptoms")
    .notEmpty()
    .withMessage("Patient Symptom(s) is required")
    .toLowerCase()
    .trim()
    .escape(),
  body("appointmentType")
    .notEmpty()
    .withMessage("Appointment Type is required")
    .toLowerCase()
    .trim(),
  body("appointmentDate")
    .notEmpty()
    .withMessage("Appointment Date is required")
    .toLowerCase()
    .trim()
    .escape()
    .custom(async (date) => {
      const today = moment().format("YYYY-MM-DD");
      const userDate = moment(date, "YYYY-MM-DD", true);
      const isValidDate = moment(userDate).isValid();
      if (!isValidDate) {
        throw new Error("Appointment date must be a valid date (yyyy-mm-dd)");
      }
      if (userDate.isBefore(today)) {
        throw new Error(
          "Appointment must either be today or later. Please choose another date",
        );
      }
    }),

  body("appointmentTime")
    .notEmpty()
    .withMessage("Appointment Time is required")
    .toLowerCase()
    .trim()
    .escape(),
  // body("timeSlotId")
  //   .notEmpty()
  //   .withMessage("Time Slot is required")
  //   .toLowerCase()
  //   .trim()
  //   .escape(),
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

      // if (appointmentMoment.isAfter(today)) {
      //   throw new Error(
      //     "Cannot Start an appointment before the scheduled date",
      //   );
      // }

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
        throw new Error("Specified Appontment Not Found");
      }

      return true;
    }),
  body("postponedDate")
    .notEmpty()
    .withMessage("New Appointment Date is required")
    .custom(async (value, { req }) => {
      const { doctor_id: doctorId } = await getDoctorByUserId(req.user.id);

      const data = await getDoctorAppointmentById({
        doctorId,
        appointmentId: value,
      });
      if (!data) {
        throw new Error("Specified Appontment Not Found");
      }

      const error = validateAppointmentPostponedDate(value);
      if (error) {
        console.log(error);
        throw new Error(error);
      }

      return true;
    }),

  body("postponedTime")
    .notEmpty()
    .withMessage("Specify new appointment time")
    .custom(async (value) => {
      const error = validateAppointmentTime(value);
      if (error) {
        console.log(error);
        throw new Error(error);
      }
      return true;
    }),
];
