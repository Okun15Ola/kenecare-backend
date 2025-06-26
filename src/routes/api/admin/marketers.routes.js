const router = require("express").Router();
const {
  GetAllMarketersController,
  GetMarketerByIdController,
  CreateMarketerController,
  UpdateMarketerController,
  DeleteMarketerController,
  VerifyMarketerPhoneNumberController,
  VerifyMarketerEmailController,
} = require("../../../controllers/admin/marketers.controller");
const { tempUpload } = require("../../../utils/file-upload.utils");
const {
  CreateMarketerValidation,
  UpdateMarketerValidation,
  MarketerEmailValidations,
  MarketerIdValidations,
  MarketerPhoneValidations,
} = require("../../../validations/admin/marketers.validations");
const { Validate } = require("../../../validations/validate");
const { requireAdminAuth } = require("../../../middlewares/auth.middleware");

router.get("/", requireAdminAuth, GetAllMarketersController);
router.get(
  "/verify-email",
  MarketerEmailValidations,
  Validate,
  VerifyMarketerEmailController,
);
router.get(
  "/verify-phone",
  requireAdminAuth,
  MarketerPhoneValidations,
  Validate,
  VerifyMarketerPhoneNumberController,
);
router.get("/:id", requireAdminAuth, GetMarketerByIdController);

router.post(
  "/",
  requireAdminAuth,
  tempUpload.single("idDocument"),
  CreateMarketerValidation,
  Validate,
  CreateMarketerController,
);
router.put(
  "/:id",
  requireAdminAuth,
  tempUpload.single("idDocument"),
  UpdateMarketerValidation,
  Validate,
  UpdateMarketerController,
);
router.delete(
  "/:id",
  requireAdminAuth,
  MarketerIdValidations,
  Validate,
  DeleteMarketerController,
);

module.exports = router;
