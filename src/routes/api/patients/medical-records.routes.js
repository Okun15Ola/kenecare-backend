const router = require("express").Router();
const {
  GetAllMedicalRecordsController,
  GetMedicalRecordByIDController,
  CreateMedicalReocrdController,
  UpdateMedicalReocrdByIdController,
  DeletemedicaRecordByIdController,
} = require("../../../controllers/patients/medical-record.controller");
const { AWSUploader } = require("../../../utils/file-upload.utils");
// const {} = require("../../../validations/medical-records.validations");
// const { Validate } = require("../../../validations/validate");

router.get("/", GetAllMedicalRecordsController);
router.get("/:id", GetMedicalRecordByIDController);

router.post("/", AWSUploader.single("document"), CreateMedicalReocrdController);
router.put("/:id", UpdateMedicalReocrdByIdController);
router.delete("/:id", DeletemedicaRecordByIdController);

module.exports = router;
