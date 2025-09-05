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
const { limiter } = require("../../../utils/rate-limit.utils");
const {
  authenticateUser,
  authorizeDoctor,
} = require("../../../middlewares/auth.middleware");

router.use(authenticateUser, limiter);

router.post(
  "/",
  AWSUploader.single("regCertificate"),
  councilValidations,
  Validate,
  CreateDoctorCouncilRegistration,
);
router.get(
  "/doc/",
  authorizeDoctor,
  GetDoctorCouncilRegistrationDocumentController,
);
router.get("/", authorizeDoctor, GetDoctorCouncilRegistrationController);
router.put(
  "/",
  AWSUploader.single("regCertificate"),
  UpdateCouncilRegistrationController,
);
module.exports = router;
