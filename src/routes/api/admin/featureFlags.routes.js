const router = require("express").Router();
const flagController = require("../../../controllers/admin/featureFlag.controller");
const { adminLimiter } = require("../../../utils/rate-limit.utils");
const { authenticateAdmin } = require("../../../middlewares/auth.middleware");
const { Validate } = require("../../../validations/validate");
const validations = require("../../../validations/admin/feature-flag.validations");

router.use(authenticateAdmin, adminLimiter);

router.get("/", flagController.GetFeatureFlagsController);

router.post(
  "/",
  validations.createFlagValidation,
  Validate,
  flagController.CreateFeatureFlagController,
);

router.put(
  "/:name",
  validations.flagNameValidation,
  Validate,
  flagController.UpdateFeatureFlagController,
);

router.patch(
  "/:name/enable",
  validations.flagNameValidation,
  Validate,
  flagController.EnableFeatureFlagController,
);

router.patch(
  "/:name/disable",
  validations.flagNameValidation,
  Validate,
  flagController.DisableFeatureFlagController,
);

router.patch(
  "/:name/rollout-percentage",
  validations.flagNameValidation,
  Validate,
  flagController.UpdateRolloutPercentageController,
);

router.delete(
  "/:name",
  validations.flagNameValidation,
  Validate,
  flagController.DeleteFeatureFlagController,
);

module.exports = router;
