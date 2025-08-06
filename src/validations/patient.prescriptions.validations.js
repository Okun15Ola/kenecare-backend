const { param } = require("express-validator");
const {
  getAppointmentPrescriptionById,
} = require("../repository/prescriptions.repository");
const { getPatientByUserId } = require("../repository/patients.repository");
const {
  getPatientAppointmentById,
} = require("../repository/patientAppointments.repository");

exports.GetPrescriptionsByAppointmentValidation = [
  param("id")
    .notEmpty()
    .withMessage("Appointment ID is required")
    .bail()
    .trim()
    .isInt({ gt: 0 })
    .escape()
    .custom(async (value, { req }) => {
      const patient = await getPatientByUserId(req.user.id);

      if (!patient) {
        throw new Error("Unauthorized Resource Access.");
      }
      const { patient_id: patientId } = patient;

      const appointment = await getPatientAppointmentById({
        patientId,
        appointmentId: value,
      });
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
    .trim()
    .escape()
    .custom(async (value, { req }) => {
      const userId = parseInt(req.user.id, 10);
      const patient = await getPatientByUserId(userId);
      if (!patient) {
        return new Error("Unauthorized Resource Access. Please Try Again");
      }

      const prescription = await getAppointmentPrescriptionById(value);

      if (!prescription) {
        throw new Error("Specified Prescription Not Found");
      }

      const { patient_id: patientId } = patient;
      const { appointment_id: appointmentId } = prescription;

      const appointment = await getPatientAppointmentById({
        patientId,
        appointmentId,
      });

      if (!appointment) {
        throw new Error("Specified Prescription Not Found");
      }

      return true;
    }),
];
