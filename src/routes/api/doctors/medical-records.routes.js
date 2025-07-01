const router = require("express").Router();
const { Validate } = require("../../../validations/validate");
const {
  GetAllSharedMedicalRecordsController,
  GetSharedMedicalRecordByIDController,
} = require("../../../controllers/doctors/medical-record.controller");
const {
  GetDoctorSharedMedicalDocumentValidation,
} = require("../../../validations/medical-records.validations");
const { limiter } = require("../../../utils/rate-limit.utils");
const {
  authenticateUser,
  authorizeDoctor,
} = require("../../../middlewares/auth.middleware");

router.use(authenticateUser, limiter, authorizeDoctor); // Authentication middleware, Rate limiting & authorize middleware applied to all routes in this router

router.get("/", GetAllSharedMedicalRecordsController);
router.get(
  "/:id",
  GetDoctorSharedMedicalDocumentValidation,
  Validate,
  GetSharedMedicalRecordByIDController,
);

module.exports = router;
