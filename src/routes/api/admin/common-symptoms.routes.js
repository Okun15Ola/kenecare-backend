const router = require("express").Router();
const { Validate } = require("../../../validations/validate");
const {
  GetCommonSymptomsController,
  GetCommonSymptomByIDController,
  CreateCommonSymptomController,
  UpdateCommonSymptomByIdController,
  UpdateCommonSymptomStatusController,
  DeleteCommonSymptomByIdController,
} = require("../../../controllers/admin/common-symptoms.controller");

const { AWSUploader } = require("../../../utils/file-upload.utils");
const {
  CreateSymptomValidation,
  UpdateSymptomValidation,
} = require("../../../validations/symptoms.validations");
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
  calculatePaginationInfo("common_symptoms"),
  GetCommonSymptomsController,
);

router.get("/:id", GetCommonSymptomByIDController);

router.post(
  "/",
  AWSUploader.single("image"),
  CreateSymptomValidation,
  Validate,
  CreateCommonSymptomController,
);

router.put(
  "/:id",
  AWSUploader.single("image"),
  UpdateSymptomValidation,
  Validate,
  UpdateCommonSymptomByIdController,
);

router.patch("/:id/", UpdateCommonSymptomStatusController);

router.delete("/:id", DeleteCommonSymptomByIdController);

module.exports = router;
