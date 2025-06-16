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

router.get("/", GetSpecializationsController);
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
