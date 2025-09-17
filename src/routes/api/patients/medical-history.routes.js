const router = require("express").Router();
const {
  GetPatientMedicalHistoryController,
  CreatePatientMedicalInfoController,
  UpdatePatientMedicalHistoryController,
} = require("../../../controllers/patients/medical-history.controller");
const { limiter } = require("../../../utils/rate-limit.utils");
const {
  createMedicalHistoryValidation,
} = require("../../../validations/patients/medical-history.validations");
const {
  authenticateUser,
  authorizePatient,
} = require("../../../middlewares/auth.middleware");
const { Validate } = require("../../../validations/validate");

router.use(authenticateUser, limiter, authorizePatient); // Authentication middleware & Rate limiting middleware applied to all routes in this router

router.post(
  "/",
  createMedicalHistoryValidation,
  Validate,
  CreatePatientMedicalInfoController,
);
router.get("/", GetPatientMedicalHistoryController);
router.put(
  "/",
  createMedicalHistoryValidation,
  Validate,
  UpdatePatientMedicalHistoryController,
);

module.exports = router;
