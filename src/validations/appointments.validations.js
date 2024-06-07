const { body, param } = require("express-validator");
const moment = require("moment");
const {
  getSpecialtyByName,
  getSpecialtiyById,
} = require("../db/db.specialities");
const { getDoctorById } = require("../db/db.doctors");

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
