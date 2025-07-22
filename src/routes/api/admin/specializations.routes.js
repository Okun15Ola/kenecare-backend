const router = require("express").Router();
const { Validate } = require("../../../validations/validate");
const {
  GetSpecializationsController,
  GetSpecializationByIDController,
  CreateSpecializationController,
  UpdateSpecializationByIdController,
  UpdateSpecializationStatusController,
  DeleteSpecializationByIdController,
} = require("../../../controllers/admin/specializations.controller");
const {
  SpecializationValidation,
  SpecializationIDValidation,
} = require("../../../validations/specialization.validation");
const { adminLimiter } = require("../../../utils/rate-limit.utils");
const { authenticateAdmin } = require("../../../middlewares/auth.middleware");
const {
  paginationValidation,
} = require("../../../validations/pagination.validations");

router.use(authenticateAdmin, adminLimiter); // Authentication middleware & Rate limiting middleware applied to all routes in this router

router.get("/", paginationValidation, Validate, GetSpecializationsController);
router.get(
  "/:id",
  SpecializationIDValidation,
  Validate,
  GetSpecializationByIDController,
);
router.post(
  "/",
  SpecializationValidation,
  Validate,
  CreateSpecializationController,
);
router.put(
  "/:id",
  SpecializationIDValidation,
  Validate,
  UpdateSpecializationByIdController,
);
router.patch(
  "/:id/",
  SpecializationValidation,
  Validate,
  UpdateSpecializationStatusController,
);
router.delete(
  "/:id",
  SpecializationIDValidation,
  Validate,
  DeleteSpecializationByIdController,
);

module.exports = router;
