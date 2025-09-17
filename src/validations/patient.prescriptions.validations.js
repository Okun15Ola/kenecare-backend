const { param } = require("express-validator");
const {
  getAppointmentPrescriptionById,
} = require("../repository/prescriptions.repository");
const {
  getAppointmentByID,
} = require("../repository/patientAppointments.repository");

exports.GetPrescriptionsByAppointmentValidation = [
  param("id")
    .notEmpty()
    .withMessage("Appointment ID is required")
    .bail()
    .trim()
    .isInt({ gt: 0 })
    .withMessage("Invalid Appointment ID")
    .bail()
    .escape()
    .custom(async (value) => {
      const appointment = await getAppointmentByID(value);
      if (!appointment) {
        throw new Error("Specified Patient Appointment Not Found");
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
        throw new Error("Specified Prescription Not Found");
      }

      const { appointment_id: appointmentId } = prescription;

      const appointment = await getAppointmentByID(appointmentId);

      if (!appointment) {
        throw new Error("Specified Prescription Not Found");
      }

      return true;
    }),
];
