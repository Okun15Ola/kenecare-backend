const router = require("express").Router();

const {
  GetAllSharedMedicalRecordsController,
  GetSharedMedicalRecordByIDController,
} = require("../../../controllers/doctors/medical-record.controller");

router.get("/", GetAllSharedMedicalRecordsController);
router.get("/:id", GetSharedMedicalRecordByIDController);

module.exports = router;
