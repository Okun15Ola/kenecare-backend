const router = require("express").Router();

const {
  GetMedicalCouncilsController,
  GetMedicalCouncilByIDController,
  CreateMedicalCouncilController,
  UpdateMedicalCouncilByIdController,
  UpdateMedicalCouncilStatusController,
  DeleteMedicalCouncilByIdController,
} = require("../../../controllers/admin/medical-council.controller");

router.get("/", GetMedicalCouncilsController);
router.post("/:id", GetMedicalCouncilByIDController);
router.post("/", CreateMedicalCouncilController);
router.put("/:id", UpdateMedicalCouncilByIdController);
router.patch("/:id/:status", UpdateMedicalCouncilStatusController);
router.delete("/:id", DeleteMedicalCouncilByIdController);
