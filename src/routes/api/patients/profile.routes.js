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
const { localProfilePicUploader } = require("../../../utils/file-upload.utils");

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
  localProfilePicUploader.single("profilepic"),
  UpdatePatientProfilePictureController,
);

module.exports = router;
