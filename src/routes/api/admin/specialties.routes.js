const router = require("express").Router();
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
const { adminLimiter } = require("../../../utils/rate-limit.utils");
const { authenticateAdmin } = require("../../../middlewares/auth.middleware");
const {
  paginationValidation,
} = require("../../../validations/pagination.validations");
const {
  calculatePaginationInfo,
} = require("../../../middlewares/paginator.middleware");

router.use(authenticateAdmin, adminLimiter); // Authentication middleware & Rate limiting middleware applied to all routes in this router

router.get(
  "/",
  paginationValidation,
  Validate,
  calculatePaginationInfo("medical_specialities"),
  GetSpecialtiesController,
);
router.get("/:id", SpecialtyIDValidation, Validate, GetSpecialtyByIDController);
router.post(
  "/",
  localMediaUploader.single("image"),
  CreateSpecialtyValidation,
  Validate,
  CreateSpecialtyController,
);
router.put(
  "/:id",
  localMediaUploader.single("image"),
  UpdateSpecialtyValidation,
  Validate,
  UpdateSpecialtyByIdController,
);
router.patch(
  "/:id/",
  SpecialtyIDValidation,
  Validate,
  UpdateSpecialtyStatusController,
);

router.delete(
  "/:id",
  SpecialtyIDValidation,
  Validate,
  DeleteSpecialtyByIdController,
);

module.exports = router;
