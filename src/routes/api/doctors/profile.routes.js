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
const { localProfilePicUploader } = require("../../../utils/file-upload.utils");

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
  localProfilePicUploader.single("profilepic"),
  UpdateDoctorProfilePictureController,
);

module.exports = router;
