const router = require("express").Router();
const { check } = require("express-validator");
const {
  CreateSpecialtyValidation,
  UpdateSpecialtyValidation,
  SpecialtyIDValidation,
} = require("../../../validations/specialty.validations");
const { Validate } = require("../../../validations/validate");
const {
  GetSpecialtiesController,
  GetSpecialtyByIDController,
  CreateSpecialtyController,
  UpdateSpecialtyByIdController,
  UpdateSpecialtyStatusController,
  DeleteSpecialtyByIdController,
} = require("../../../controllers/admin/specialties.controller");
const { localMediaUploader } = require("../../../utils/file-upload.utils");

router.get("/", GetSpecialtiesController);
router.get("/:id", SpecialtyIDValidation, Validate, GetSpecialtyByIDController);
router.post(
  "/",
  localMediaUploader.single("image"),
  CreateSpecialtyValidation,
  Validate,
  CreateSpecialtyController
);
router.put(
  "/:id",
  UpdateSpecialtyValidation,
  Validate,
  UpdateSpecialtyByIdController
);
router.patch(
  "/:id/",
  SpecialtyIDValidation,
  Validate,
  UpdateSpecialtyStatusController
);
// router.patch(
//   "/:id/image",
//   SpecialtyIDValidation,
//   Validate,
//   UpdateSpecialtyStatusController
// );
router.delete(
  "/:id",
  SpecialtyIDValidation,
  Validate,
  DeleteSpecialtyByIdController
);

module.exports = router;
