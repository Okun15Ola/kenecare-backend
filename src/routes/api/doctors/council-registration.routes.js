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

router.use(authenticateUser, limiter, authorizeDoctor); // Authentication middleware & Rate limiting middleware applied to all routes in this router

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
