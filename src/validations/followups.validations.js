const { body, param } = require("express-validator");
const moment = require("moment");
const { getSpecialtiyById } = require("../db/db.specialities");
const { getDoctorByUserId } = require("../db/db.doctors");
const { getDoctorAppointmentById } = require("../db/db.appointments.doctors");
const Response = require("../utils/response.utils");

const today = moment().format("YYYY-MM-DD");

exports.CreateFollowUpValidation = [
  body("appointmentId")
    .notEmpty()
    .withMessage("Appointment Id is required")
    .bail()
    .trim()
    .escape()
    .isNumeric({ no_symbols: true, locale: "en-US" })
    .withMessage("Appointment ID must be a valid ID")
    .bail()
    .custom(async (value, { req }) => {
      const appointmentId = parseInt(value, 10);
      const doctor = await getDoctorByUserId(parseInt(req.user.id, 10));
      if (!doctor) {
        throw new Error("Error Creating Follow up. ");
      }
      const { doctor_id: doctorId } = doctor;
      const appointment = await getDoctorAppointmentById({
        appointmentId,
        doctorId,
      });

      if (!appointment) {
        throw new Error(
          "Appointment Not Found. Please select a valid appointment",
        );
      }

      const { appointment_status: appointmentStatus } = appointment;
      if (appointmentStatus === "pending") {
        throw new Error(
          "Appointment must be approved before setting up a follow-up",
        );
      }

      return true;
    }),

  body("followUpReason")
    .notEmpty()
    .withMessage("Follow up reason is required")
    .bail()
    .trim()
    .escape(),
  body("followUpType")
    .notEmpty()
    .withMessage("Follow Up Type is required")
    .toLowerCase()
    .trim(),
  body("followUpDate")
    .notEmpty()
    .withMessage("Follow Up Date is required")
    .bail()
    .toLowerCase()
    .trim()
    .escape()
    .custom(async (date) => {
      const userDate = moment(date, "YYYY-MM-DD", true);
      const isValidDate = moment(userDate).isValid();

      if (!isValidDate) {
        throw new Error("Follow up date must be a valid date (yyyy-mm-dd)");
      }
      if (userDate.isSameOrBefore(today)) {
        throw new Error(
          "Follow up date must not be today's date or an older date,. Please choose an earlier date",
        );
      }
    })
    .bail(),

  body("followUpTime")
    .notEmpty()
    .withMessage("Follow up Time is required")
    .toLowerCase()
    .trim()
    .escape(),
];

exports.StartAppointmentValidation = [
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

      if (appointmentStatus === "started") {
        throw Response.NOT_MODIFIED();
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

      return true;
    }),
];

exports.SpecialtyIDValidation = [
  param("id")
    .notEmpty()
    .withMessage("Specialty ID is required")
    .trim()
    .escape()
    .custom(async (id) => {
      const data = await getSpecialtiyById(id);
      if (!data) {
        throw new Error("Specialty Not Found");
      }
    }),
];
