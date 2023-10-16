const router = require("express").Router();
const {
  GetServicesController,
  GetServiceByIDController,
  CreateServiceController,
  UpdateServiceByIdController,
  UpdateServiceStatusController,
  DeleteServiceByIdController,
} = require("../../../controllers/admin/services.controller");

router.get("/", GetServicesController);
router.post("/:id", GetServiceByIDController);
router.post("/", CreateServiceController);
router.put("/:id", UpdateServiceByIdController);
router.patch("/:id/:status", UpdateServiceStatusController);
router.delete("/:id", DeleteServiceByIdController);
