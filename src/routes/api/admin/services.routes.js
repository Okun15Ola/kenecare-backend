const router = require("express").Router();
const {
  GetServicesController,
  GetServiceByIDController,
  CreateServiceController,
  UpdateServiceByIdController,
  UpdateServiceStatusController,
  DeleteServiceByIdController,
} = require("../../../controllers/admin/services.controller");
const { adminLimiter } = require("../../../utils/rate-limit.utils");
const { authenticateAdmin } = require("../../../middlewares/auth.middleware");

router.use(authenticateAdmin, adminLimiter); // Authentication middleware & Rate limiting middleware applied to all routes in this router

router.get("/", GetServicesController);
router.post("/:id", GetServiceByIDController);
router.post("/", CreateServiceController);
router.put("/:id", UpdateServiceByIdController);
router.patch("/:id/:status", UpdateServiceStatusController);
router.delete("/:id", DeleteServiceByIdController);

module.exports = router;
