const router = require("express").Router();
const { body, check, checkSchema } = require("express-validator");
const { Validate } = require("../../../validations/validate");
const {
  GetCommonSymptomsController,
  GetCommonSymptomByIDController,
  CreateCommonSymptomController,
  UpdateCommonSymptomByIdController,
  UpdateCommonSymptomStatusController,
  DeleteCommonSymptomByIdController,
} = require("../../../controllers/admin/common-symptoms.controller");

const { AWSUploader } = require("../../../utils/file-upload.utils");
const {
  CreateSymptomValidation,
  UpdateSymptomValidation,
} = require("../../../validations/symptoms.validations");

router.get("/", GetCommonSymptomsController);

router.get("/:id", GetCommonSymptomByIDController);

router.post(
  "/",
  AWSUploader.single("image"),
  CreateSymptomValidation,
  Validate,
  CreateCommonSymptomController
);

router.put(
  "/:id",
  AWSUploader.single("image"),
  UpdateSymptomValidation,
  Validate,
  UpdateCommonSymptomByIdController
);

router.patch("/:id/", UpdateCommonSymptomStatusController);

router.delete("/:id", DeleteCommonSymptomByIdController);

module.exports = router;
