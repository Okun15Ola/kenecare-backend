const { param, body, check } = require("express-validator");
const { getDoctorByUserId } = require("../repository/doctors.repository");
const {
  getDoctorAppointmentById,
} = require("../repository/doctorAppointments.repository");
const {
  getAppointmentPrescriptionById,
} = require("../repository/prescriptions.repository");

exports.CreatePrescriptionValidation = [
  body("appointmentId")
    .notEmpty()
    .withMessage("Appointment ID is required")
    .bail()
    .isInt()
    .custom(async (value, { req }) => {
      const doctor = await getDoctorByUserId(req.user.id);

      if (doctor) {
        const { doctor_id: doctorId } = doctor;
        const appointment = await getDoctorAppointmentById({
          doctorId,
          appointmentId: value,
        });
        if (!appointment) {
          throw new Error("Specfied Doctor Appintment Not Found");
        }
        return true;
      }
      throw new Error("Unauthorized Action. Please Try Again");
    }),
  body("diagnosis")
    .notEmpty()
    .withMessage("Prescription diagnosis is required")
    .bail()
    .trim()
    .escape(),
  body("medicines")
    .notEmpty()
    .isArray({ min: 1, max: 10 })
    .withMessage("Medicines must contain at least one prescribed drug")
    .bail(),
  check("medicines.*.medicineName")
    .notEmpty()
    .withMessage("Medicine name is required")
    .bail()
    .trim()
    .escape(),
  check("medicines.*.strength")
    .notEmpty()
    .withMessage("Medicine strength is required")
    .bail()
    .trim()
    .escape(),
  check("medicines.*.dosage")
    .notEmpty()
    .withMessage("Medicine dosage is required")
    .bail()
    .trim()
    .escape(),
  check("medicines.*.treatmentDuration")
    .notEmpty()
    .withMessage("Treatment Duration is required")
    .bail()
    .trim()
    .escape(),
  body("comment").trim().escape(),
];

exports.UpadatePrescriptionValidation = [
  param("id")
    .notEmpty()
    .withMessage("Prescription ID is required")
    .trim()
    .escape()
    .custom(async (value) => {
      const id = parseInt(value, 10);
      const data = await getAppointmentPrescriptionById(id);
      if (!data) {
        throw new Error("Prescription Not Found");
      }
      return true;
    }),
  body("appointmentId")
    .notEmpty()
    .withMessage("Appointment ID is required")
    .isInt()
    .custom(async (value, { req }) => {
      const doctor = await getDoctorByUserId(req.user.id);

      if (doctor) {
        const { doctor_id: doctorId } = doctor;
        const appointment = await getDoctorAppointmentById({
          doctorId,
          appointmentId: value,
        });
        if (!appointment) {
          throw new Error("Appintment Not Found");
        }
        return true;
      }
      throw new Error("Unauthorized Action");
    }),
  body("diagnosis")
    .notEmpty()
    .withMessage("Prescription diagnosis is required")
    .trim()
    .escape(),
  body("medicines")
    .notEmpty()
    .isArray({ min: 1, max: 10 })
    .withMessage("Medicines must contain at least one prescribed drug"),
  check("medicines.*.medicineName")
    .notEmpty()
    .withMessage("Medicine name is required")
    .trim()
    .escape(),
  check("medicines.*.strength")
    .notEmpty()
    .withMessage("Medicine strength is required")
    .trim()
    .escape(),
  check("medicines.*.dosage")
    .notEmpty()
    .withMessage("Medicine dosage is required")
    .trim()
    .escape(),
  check("medicines.*.treatmentDuration")
    .notEmpty()
    .withMessage("Treatment Duration is required")
    .trim()
    .escape(),
  body("comment").trim().escape(),
];

exports.GetPrescriptionsByAppointmentValidation = [
  param("id")
    .notEmpty()
    .withMessage("Appointment ID is required")
    .bail()
    .trim()
    .escape()
    .custom(async (value, { req }) => {
      const doctor = await getDoctorByUserId(req.user.id);
      if (!doctor) {
        throw new Error("Doctor Not Found!");
      }
      const { doctor_id: doctorId } = doctor;
      const appointment = await getDoctorAppointmentById({
        doctorId,
        appointmentId: value,
      });
      if (!appointment) {
        throw new Error("Appointment Not Found");
      }
      return true;
    }),
];

exports.GetPrescriptionByIdValidation = [
  param("id")
    .notEmpty()
    .withMessage("Prescription ID is required")
    .isInt("Invalid Prescription ID")
    .trim()
    .escape()
    .custom(async (value) => {
      const prescription = await getAppointmentPrescriptionById(value);
      if (!prescription) {
        throw new Error("Prescription not found");
      }
      return true;
    }),
];
