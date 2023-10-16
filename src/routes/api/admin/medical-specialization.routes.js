const router = require("express").Router();

const {
  GetSpecializationsController,
  GetSpecializationByIDController,
  CreateSpecializationController,
  UpdateSpecializationByIdController,
  UpdateSpecializationStatusController,
  DeleteSpecializationByIdController,
} = require("../../../controllers/admin/specializations.controller");

router.get("/", GetSpecializationsController);
router.post("/:id", GetSpecializationByIDController);
router.post("/", CreateSpecializationController);
router.put("/:id", UpdateSpecializationByIdController);
router.patch("/:id/:status", UpdateSpecializationStatusController);
router.delete("/:id", DeleteSpecializationByIdController);
