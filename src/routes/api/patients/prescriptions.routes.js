const router = require("express").Router();
const { param } = require("express-validator");
const {
  GetAppointmentPrescriptionController,
  GetAppointmentPrescriptionsController,
} = require("../../../controllers/patients/prescriptions.controller");

const { Validate } = require("../../../validations/validate");

const {
  getAppointmentPrescriptionById,
} = require("../../../db/db.prescriptions");
const { getPatientByUserId } = require("../../../db/db.patients");
const {
  getPatientAppointmentById,
} = require("../../../db/db.appointments.patients");

router.get(
  "/appointment/:id",
  [
    param("id")
      .notEmpty()
      .withMessage("Appointment ID is required")
      .isInt("Invalid Appoitment ID")
      .trim()
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
          throw new Error("Unauthorized Resource Access.");
        }
        return true;
      }),
  ],
  Validate,
  GetAppointmentPrescriptionsController,
);
router.get(
  "/:id",
  [
    param("id")
      .notEmpty()
      .withMessage("Prescription ID is required")
      .trim()
      .escape()
      .custom(async (value, { req }) => {
        const prescription = await getAppointmentPrescriptionById(value);
        if (!prescription) {
          throw new Error("Prescription not found");
        }

        const patient = await getPatientByUserId(req.user.id);
        if (!patient) {
          throw new Error("Unauthorized Resource Access.");
        }
        const { patient_id: patientId } = patient;
        const { appointment_id: appointmentId } = prescription;
        const appointment = await getPatientAppointmentById({
          patientId,
          appointmentId,
        });
        if (!appointment) {
          throw new Error("Unauthorized Resource Access.");
        }

        return true;
      }),
  ],
  Validate,
  GetAppointmentPrescriptionController,
);

module.exports = router;
