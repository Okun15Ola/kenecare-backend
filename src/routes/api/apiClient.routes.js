const router = require("express").Router();
const apiClientController = require("../../controllers/apiClient.controller");
const { adminLimiter } = require("../../utils/rate-limit.utils");
const { authenticateAdmin } = require("../../middlewares/auth.middleware");
const { Validate } = require("../../validations/validate");
const {
  createClientValidations,
  clientUuidValidations,
} = require("../../validations/admin/api-client.validations");

router.use(authenticateAdmin, adminLimiter);

router.get("/", apiClientController.getAllClientsController);

router.post(
  "/",
  createClientValidations,
  Validate,
  apiClientController.createClientController,
);

router.delete(
  "/:clientUuid",
  clientUuidValidations,
  Validate,
  apiClientController.deleteClientController,
);

module.exports = router;
