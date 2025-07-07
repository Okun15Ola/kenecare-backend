const router = require("express").Router();
const {
  GetPatientMedicalHistoryController,
  CreatePatientMedicalInfoController,
  UpdatePatientMedicalHistoryController,
} = require("../../../controllers/patients/medical-history.controller");
const { limiter } = require("../../../utils/rate-limit.utils");
const {
  authenticateUser,
  authorizePatient,
} = require("../../../middlewares/auth.middleware");

router.use(authenticateUser, limiter, authorizePatient); // Authentication middleware & Rate limiting middleware applied to all routes in this router

router.post("/", CreatePatientMedicalInfoController);
router.get("/", GetPatientMedicalHistoryController);
router.put("/", UpdatePatientMedicalHistoryController);

module.exports = router;
