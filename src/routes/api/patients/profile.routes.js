const router = require("express").Router();
const { Validate } = require("../../../validations/validate");
const {
  GetPatientProfileController,
  CreatePatientProfileController,
  UpdatePatientProfileController,
  UpdatePatientProfilePictureController,
} = require("../../../controllers/patients/profile.controller");
const {
  profileValidation,
} = require("../../../validations/patients/patient-profile.validations");
const { AWSUploader } = require("../../../utils/file-upload.utils");
const { limiter } = require("../../../utils/rate-limit.utils");
const {
  authenticateUser,
  authorizePatient,
} = require("../../../middlewares/auth.middleware");

router.use(authenticateUser, limiter, authorizePatient); // Authentication middleware & Rate limiting middleware applied to all routes in this router

router.get("/profile", GetPatientProfileController);
router.post(
  "/profile",
  profileValidation,
  Validate,
  CreatePatientProfileController,
);
router.put(
  "/profile/",
  profileValidation,
  Validate,
  UpdatePatientProfileController,
);
router.patch(
  "/profile/",
  AWSUploader.single("profilepic"),
  UpdatePatientProfilePictureController,
);

module.exports = router;
