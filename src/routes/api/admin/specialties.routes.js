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
const { AWSUploader } = require("../../../utils/file-upload.utils");
const { adminLimiter } = require("../../../utils/rate-limit.utils");
const { authenticateAdmin } = require("../../../middlewares/auth.middleware");
const {
  paginationValidation,
} = require("../../../validations/pagination.validations");

router.use(authenticateAdmin, adminLimiter); // Authentication middleware & Rate limiting middleware applied to all routes in this router

router.get("/", paginationValidation, Validate, GetSpecialtiesController);
router.get("/:id", SpecialtyIDValidation, Validate, GetSpecialtyByIDController);
router.post(
  "/",
  AWSUploader.single("image"),
  CreateSpecialtyValidation,
  Validate,
  CreateSpecialtyController,
);
router.put(
  "/:id",
  AWSUploader.single("image"),
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
