const router = require("express").Router();
const { param, query } = require("express-validator");
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
const { comparePassword } = require("../../../utils/auth.utils");
const Response = require("../../../utils/response.utils");
const logger = require("../../../middlewares/logger.middleware");

router.get(
  "/appointment/:id",
  [
    param("id")
      .notEmpty()
      .withMessage("Appointment ID is required")
      .bail()
      .isInt("Invalid Appoitment ID")
      .bail()
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
      .bail()
      .trim()
      .escape()
      .custom(async (value, { req }) => {
        const prescription = await getAppointmentPrescriptionById(value);
        if (!prescription) {
          throw new Error("Prescription not found");
        }

        const patient = await getPatientByUserId(req.user.id);
        if (!patient) {
          return new Error("Unauthorized Resource Access.");
        }
        const { patient_id: patientId } = patient;
        const { appointment_id: appointmentId } = prescription;
        const appointment = await getPatientAppointmentById({
          patientId,
          appointmentId,
        });
        if (!appointment) {
          return new Error("Unauthorized Resource Access.");
        }

        return true;
      })
      .bail(),
    query("token")
      .notEmpty()
      .withMessage("Prescription Access Token is required")
      .bail()
      .custom(async (value, { req }) => {
        const prescription = await getAppointmentPrescriptionById(
          req.params.id,
        );
        if (prescription) {
          const { access_jwt: hashedToken } = prescription;

          // Check accesstoken
          if (!hashedToken) {
            throw new Error("Unauthorized Resource Access.");
          }

          const isTokenMatch = await comparePassword({
            plainPassword: value,
            hashedPassword: hashedToken,
          }).catch((error) => {
            if (error) {
              logger.error(error);
              throw new Error("Invalid Prescription Access Token");
            }
          });

          if (!isTokenMatch) {
            return Response.BAD_REQUEST({
              message: "Invalid prescription Access Token",
            });
          }
          return true;
        }
        return false;
      }),
  ],
  Validate,
  GetAppointmentPrescriptionController,
);

module.exports = router;
