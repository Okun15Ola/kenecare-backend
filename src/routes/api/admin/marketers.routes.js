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
const { adminLimiter } = require("../../../utils/rate-limit.utils");
const { authenticateAdmin } = require("../../../middlewares/auth.middleware");
const {
  paginationValidation,
} = require("../../../validations/pagination.validations");
const {
  calculatePaginationInfo,
} = require("../../../middlewares/paginator.middleware");

router.use(authenticateAdmin, adminLimiter); // Authentication middleware & Rate limiting middleware applied to all routes in this router

router.get(
  "/",
  paginationValidation,
  Validate,
  calculatePaginationInfo("marketers"),
  GetAllMarketersController,
);
router.get(
  "/verify-email",
  MarketerEmailValidations,
  Validate,
  VerifyMarketerEmailController,
);
router.get(
  "/verify-phone",
  MarketerPhoneValidations,
  Validate,
  VerifyMarketerPhoneNumberController,
);
router.get("/:id", GetMarketerByIdController);

router.post(
  "/",
  tempUpload.single("idDocument"),
  CreateMarketerValidation,
  Validate,
  CreateMarketerController,
);
router.put(
  "/:id",
  tempUpload.single("idDocument"),
  UpdateMarketerValidation,
  Validate,
  UpdateMarketerController,
);
router.delete(
  "/:id",
  MarketerIdValidations,
  Validate,
  DeleteMarketerController,
);

module.exports = router;
