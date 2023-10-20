const router = require("express").Router();
const {
  GetCommonSymptomsController,
  GetCommonSymptomByIDController,
  CreateCommonSymptomController,
  UpdateCommonSymptomByIdController,
  UpdateCommonSymptomStatusController,
  DeleteCommonSymptomByIdController,
} = require("../../../controllers/admin/common-symptoms.controller");

router.get("/", GetCommonSymptomsController);

router.get("/:id",GetCommonSymptomByIDController);

router.post("/", CreateCommonSymptomController);

router.put("/:id", UpdateCommonSymptomByIdController);

router.patch("/:id/", UpdateCommonSymptomStatusController);

router.delete("/:id", DeleteCommonSymptomByIdController);

module.exports = router;
