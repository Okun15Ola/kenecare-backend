const { param, body, check } = require("express-validator");
const {
  getAppointmentById,
} = require("../repository/doctorAppointments.repository");
const {
  getAppointmentPrescriptionById,
} = require("../repository/prescriptions.repository");

exports.CreatePrescriptionValidation = [
  body("appointmentId")
    .notEmpty()
    .withMessage("Appointment ID is required")
    .bail()
    .isInt({ gt: 0 })
    .withMessage("Invalid Appointment ID")
    .bail()
    .custom(async (value) => {
      const appointment = await getAppointmentById(value);
      if (!appointment) {
        throw new Error("Specified Doctor Appointment Not Found");
      }
      return true;
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
    .bail()
    .isInt({ gt: 0 })
    .withMessage("Invalid Prescription ID")
    .bail()
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
    .bail()
    .isInt({ gt: 0 })
    .withMessage("Invalid Appointment ID")
    .bail()
    .custom(async (value) => {
      const appointment = await getAppointmentById(value);
      if (!appointment) {
        throw new Error("Specified Doctor Appointment Not Found");
      }
      return true;
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
    .withMessage("Medicines must contain at least one prescribed drug"),
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

exports.GetPrescriptionsByAppointmentValidation = [
  param("id")
    .notEmpty()
    .withMessage("Appointment ID is required")
    .bail()
    .isInt({ gt: 0 })
    .withMessage("Invalid Appointment ID")
    .bail()
    .trim()
    .escape()
    .custom(async (value) => {
      const appointment = await getAppointmentById(value);
      if (!appointment) {
        throw new Error("Specified Doctor Appointment Not Found");
      }
      return true;
    }),
];

exports.GetPrescriptionByIdValidation = [
  param("id")
    .notEmpty()
    .withMessage("Prescription ID is required")
    .bail()
    .isInt({ gt: 0 })
    .withMessage("Invalid Prescription ID")
    .bail()
    .trim()
    .escape()
    .custom(async (value) => {
      const prescription = await getAppointmentPrescriptionById(value);
      if (!prescription) {
        throw new Error("Prescription Not Found");
      }
      return true;
    }),
];
