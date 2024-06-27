const router = require("express").Router();
const {
  GetPatientMedicalHistoryController,
  CreatePatientMedicalInfoController,
  UpdatePatientMedicalHistoryController,
} = require("../../../controllers/patients/medical-history.controller");

router.post("/", CreatePatientMedicalInfoController);
router.get("/", GetPatientMedicalHistoryController);
router.put("/", UpdatePatientMedicalHistoryController);

module.exports = router;
