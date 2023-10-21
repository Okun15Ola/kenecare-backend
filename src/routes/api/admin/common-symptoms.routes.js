const router = require("express").Router();
const {
  GetCommonSymptomsController,
  GetCommonSymptomByIDController,
  CreateCommonSymptomController,
  UpdateCommonSymptomByIdController,
  UpdateCommonSymptomStatusController,
  DeleteCommonSymptomByIdController,
} = require("../../../controllers/admin/common-symptoms.controller");

const { servicesImageUploader } = require("../../../utils/file-upload.utils");

router.get("/", GetCommonSymptomsController);

router.get("/:id", GetCommonSymptomByIDController);

router.post(
  "/",
  servicesImageUploader.single("image"),
  CreateCommonSymptomController
);

router.put("/:id", UpdateCommonSymptomByIdController);

router.patch("/:id/", UpdateCommonSymptomStatusController);

router.delete("/:id", DeleteCommonSymptomByIdController);

module.exports = router;
