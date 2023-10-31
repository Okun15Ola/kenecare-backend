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

const {
  localMediaUploader: mediaUploaded,
} = require("../../../utils/file-upload.utils");

router.get("/", GetCommonSymptomsController);

router.get("/:id", GetCommonSymptomByIDController);

router.post(
  "/",

  CreateCommonSymptomController
);

router.put("/:id", UpdateCommonSymptomByIdController);

router.patch("/:id/", UpdateCommonSymptomStatusController);

router.delete("/:id", DeleteCommonSymptomByIdController);

module.exports = router;
