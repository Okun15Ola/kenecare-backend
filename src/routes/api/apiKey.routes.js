const router = require("express").Router();
const apiKeyController = require("../../controllers/apiKey.controller");
const { adminLimiter } = require("../../utils/rate-limit.utils");
const { authenticateAdmin } = require("../../middlewares/auth.middleware");
const { Validate } = require("../../validations/validate");
const {
  createKeyValidations,
  keyUuidValidations,
} = require("../../validations/admin/api-key.validations");

router.use(authenticateAdmin, adminLimiter);

router.post(
  "/",
  createKeyValidations,
  Validate,
  apiKeyController.createApiKeycontroller,
);

router.patch(
  "/deactivate/:keyUuid",
  keyUuidValidations,
  Validate,
  apiKeyController.deactivateApiKeyController,
);

router.patch(
  "/:keyUuid/extend-key-expiry",
  keyUuidValidations,
  Validate,
  apiKeyController.extendApiKeyExpiryController,
);

module.exports = router;
