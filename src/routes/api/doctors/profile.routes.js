const router = require("express").Router();
const { Validate } = require("../../../validations/validate");
const {
  GetDoctorProfileController,
  CreateDoctorProfileController,
  UpdateDoctorProfileByIdController,
  UpdateDoctorProfilePictureController,
} = require("../../../controllers/doctors/profile.controller");
const {
  createDoctorProfileValidations,
} = require("../../../validations/doctors/doctor-profile.validations");
const { AWSUploader } = require("../../../utils/file-upload.utils");
const { limiter } = require("../../../utils/rate-limit.utils");
const {
  authenticateUser,
  authorizeDoctor,
} = require("../../../middlewares/auth.middleware");

router.use(authenticateUser, limiter, authorizeDoctor); // Authentication middleware & Rate limiting middleware applied to all routes in this router

router.get("/profile", GetDoctorProfileController);
router.post(
  "/profile",
  createDoctorProfileValidations,
  Validate,
  CreateDoctorProfileController,
);
router.put(
  "/profile/",
  createDoctorProfileValidations,
  Validate,
  UpdateDoctorProfileByIdController,
);
router.patch(
  "/profile/",
  AWSUploader.single("profilepic"),
  UpdateDoctorProfilePictureController,
);

module.exports = router;
