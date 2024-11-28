const router = require("express").Router();
const { query, param } = require("express-validator");
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
} = require("../../../validations/admin/marketers.validations");
const { Validate } = require("../../../validations/validate");
const { getMarketerByVerficationToken } = require("../../../db/db.marketers");
const { requireAdminAuth } = require("../../../middlewares/auth.middleware");

router.get("/", requireAdminAuth, GetAllMarketersController);
router.get(
  "/verify-email",
  [
    query("token")
      .escape()
      .trim()
      .notEmpty()
      .withMessage("Verification token is required")
      .bail()
      .isJWT()
      .withMessage("Corrupted Email Verification Token")
      .bail()
      .custom(async (token) => {
        const data = await getMarketerByVerficationToken(token);

        if (!data) {
          throw new Error("Invalid Email Verification Token");
        }

        return true;
      })
      .bail(),
  ],
  Validate,
  VerifyMarketerEmailController,
);
router.get(
  "/verify-phone",
  requireAdminAuth,
  [
    query("token")
      .notEmpty()
      .withMessage("Verification token is required")
      .bail()
      .isNumeric({ no_symbols: true })
      .isLength({ max: 6, min: 6 })
      .withMessage("Invalid Phone Verification Token")
      .custom(async (token) => {
        const data = await getMarketerByVerficationToken(token);

        if (!data) {
          throw new Error("Invalid Phone Verification Token");
        }

        return true;
      }),
  ],
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
router.put("/:id", requireAdminAuth, [], Validate, UpdateMarketerController);
router.delete(
  "/:id",
  requireAdminAuth,
  [
    param("id")
      .notEmpty()
      .withMessage("Marketer ID is required")
      .bail()
      .isInt({ allow_leading_zeroes: false })
      .withMessage("Invalid Marketer ID")
      .bail(),
  ],
  Validate,
  DeleteMarketerController,
);

module.exports = router;
