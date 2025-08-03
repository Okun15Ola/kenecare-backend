const router = require("express").Router();
const apiKeyController = require("../../controllers/apiKey.controller");
const { adminLimiter } = require("../../utils/rate-limit.utils");
const { authenticateAdmin } = require("../../middlewares/auth.middleware");
const { Validate } = require("../../validations/validate");
const {
  createKeyValidations,
  keyUuidValidations,
} = require("../../validations/admin/api-key.validations");
const {
  authenticateClient,
  refreshClientToken,
} = require("../../middlewares/apiKey.middlewares");

// Endpoint to get a new access token and refresh token
// This endpoint is public and requires the x-api-key and x-api-secret headers.
router.post("/token", authenticateClient);

// Endpoint to refresh an expired access token
// This endpoint is also public and requires the apiKey and refreshToken in the request body.
router.post("/refresh", refreshClientToken);

router.use(authenticateAdmin, adminLimiter);

router.get("/", apiKeyController.getAllApiKeyController);

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
