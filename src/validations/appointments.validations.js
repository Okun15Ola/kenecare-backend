const { body, param } = require("express-validator");
const moment = require("moment");
const {
  getAppointmentByID,
} = require("../repository/patientAppointments.repository");
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
    })
    .bail(),
  body("doctorId")
    .notEmpty()
    .withMessage("Doctor ID is required")
    .bail()
    .isInt({ allow_leading_zeroes: false, gt: 0 })
    .withMessage("Invalid Doctor Id")
    .bail()
    .custom(async (doctorId) => {
      const data = await getDoctorById(doctorId);
      if (!data) {
        throw new Error("Specified Doctor Not Found");
      }
      return true;
    }),
  body("specialtyId")
    .notEmpty()
    .withMessage("Specialty is required")
    .bail()
    .isInt({ allow_leading_zeroes: false, gt: 0 })
    .withMessage("Invalid Specialty Id")
    .bail()
    .custom(async (id) => {
      const data = await getSpecialtiyById(id);
      if (!data) {
        throw new Error("Specified Specialty Not Found");
      }
      return true;
    }),
  body("symptoms")
    .notEmpty()
    .withMessage("Patient Symptom(s) is required")
    .bail()
    .toLowerCase()
    .trim()
    .escape(),
  body("appointmentType")
    .notEmpty()
    .withMessage("Appointment Type is required")
    .bail()
    .toLowerCase()
    .isIn(["online_consultation", "doctor_visit", "patient_visit"])
    .withMessage("Invalid Appointment Type")
    .escape(),
  body("appointmentDate")
    .notEmpty()
    .withMessage("Appointment Date is required")
    .bail()
    .toLowerCase()
    .trim()
    .escape()
    .custom(async (date) => {
      validateDate(date);
    }),
  body("appointmentTime")
    .notEmpty()
    .withMessage("Appointment Time is required")
    .bail()
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
    .bail()
    .custom(async (value, { req }) => {
      const { doctor_id: doctorId } = await getDoctorByUserId(req.user.id);

      if (!doctorId) {
        throw new Error(
          "Unauthorized Access. This action can only be performed by a doctor",
        );
      }

      const data = await getDoctorAppointmentById({
        doctorId,
        appointmentId: value,
      });

      if (!data) {
        throw new Error("Appointment Not Found");
      }

      const {
        appointment_status: appointmentStatus,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
      } = data;

      req.appointmentDate = appointmentDate;

      if (appointmentStatus === "postponed") {
        throw new Error("Appointment already postponed to a future date");
      }

      const now = moment();
      const appointmentDateTime = moment(
        `${appointmentDate} ${appointmentTime}`,
        "YYYY-MM-DD HH:mm:ss",
      );

      // Allow postponing past appointments by removing this check
      // if (appointmentDateTime.isBefore(now)) {
      //   throw new Error("You cannot postpone a past appointment");
      // }

      const hoursDiff = appointmentDateTime.diff(now, "hours");

      if (hoursDiff < 48) {
        throw new Error(
          "Appointment can only be postponed at least 48 hours in advance",
        );
      }

      return true;
    }),
  body("postponedDate")
    .notEmpty()
    .withMessage("New Appointment Date is required")
    .bail()
    .custom(async (value, { req }) => {
      const error = validateAppointmentPostponedDate(
        value,
        req.appointmentDate,
      );
      if (error) {
        throw new Error(error);
      }

      req.appointmentDate = null;
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

/**
 * Validation for appointment ID parameter
 */
exports.AppointmentIdValidation = [
  param("id")
    .notEmpty()
    .withMessage("Appointment ID is required")
    .bail()
    .isInt({ gt: 0, allow_leading_zeroes: false })
    .withMessage("Appointment ID must be a valid positive number")
    .bail()
    .escape(),
];

exports.FeedBackValidation = [
  body("appointmentId")
    .notEmpty()
    .withMessage("Appointment ID is required.")
    .bail()
    .isInt({ gt: 0, allow_leading_zeroes: false })
    .withMessage("Appointment ID must be a valid positive number")
    .bail()
    .trim()
    .escape()
    .custom(async (value) => {
      const appointmentId = parseInt(value, 10);
      const appointment = await getAppointmentByID(appointmentId);
      if (!appointment) {
        throw new Error("Specified Appointment Does Not Exist");
      }
      return true;
    }),
  body("feedback")
    .notEmpty()
    .withMessage("Feedback content is required.")
    .bail()
    .isString()
    .withMessage("Feedback content must be a string.")
    .bail()
    .isLength({ min: 5, max: 1000 })
    .withMessage("Feedback content must be between 5 to 1000 characters.")
    .escape(),
];
