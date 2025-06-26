const router = require("express").Router();
const { Validate } = require("../../../validations/validate");
const {
  GetDoctorCouncilRegistrationController,
  GetDoctorCouncilRegistrationDocumentController,
  CreateDoctorCouncilRegistration,
  UpdateCouncilRegistrationController,
} = require("../../../controllers/doctors/council-registration.controller");
const {
  councilValidations,
} = require("../../../validations/doctors/council-registration.validations");
const { AWSUploader } = require("../../../utils/file-upload.utils");

router.post(
  "/",
  AWSUploader.single("regCertificate"),
  councilValidations,
  Validate,
  CreateDoctorCouncilRegistration,
);
router.get("/", GetDoctorCouncilRegistrationController);
router.get("/doc/:filename", GetDoctorCouncilRegistrationDocumentController);
router.put(
  "/",
  AWSUploader.single("regCertificate"),
  UpdateCouncilRegistrationController,
);
module.exports = router;
