const router = require("express").Router();
const { param, body, check } = require("express-validator");
const {
  GetAppointmentPrescriptionController,
  GetAppointmentPrescriptionsController,
  CreatePrescriptionController,
  UpdatePrescriptionController,
} = require("../../../controllers/doctors/prescriptions.controller");

const { Validate } = require("../../../validations/validate");
const {
  getDoctorAppointmentById,
} = require("../../../db/db.appointments.doctors");
const { getDoctorByUserId } = require("../../../db/db.doctors");
const {
  getAppointmentPrescriptionById,
} = require("../../../db/db.prescriptions");

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
          throw new Error("Appintment Not Found");
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
      .isInt("Invalid Appoitment ID")
      .trim()
      .escape()
      .custom(async (value) => {
        const prescription = await getAppointmentPrescriptionById(value);
        if (!prescription) {
          throw new Error("Prescription not found");
        }
        return true;
      }),
  ],
  Validate,
  GetAppointmentPrescriptionController,
);
router.post(
  "/",
  [
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
  ],
  Validate,
  CreatePrescriptionController,
);

router.put(
  "/:id",
  [
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
  ],
  Validate,
  UpdatePrescriptionController,
);

module.exports = router;
