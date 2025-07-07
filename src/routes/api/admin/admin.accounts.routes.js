const router = require("express").Router();
const { Validate } = require("../../../validations/validate");
const {
  AdminUpdateAccountStatusController,
} = require("../../../controllers/admin/auth.admin.controller");
const {
  AdminUpdateStatusValidations,
  AdminIDValidations,
} = require("../../../validations/auth.admin.validations");
const { adminLimiter } = require("../../../utils/rate-limit.utils");
const { authenticateAdmin } = require("../../../middlewares/auth.middleware");

router.use(authenticateAdmin, adminLimiter); // Authentication middleware & Rate limiting middleware applied to all routes in this router

router.get("/", (req, res, next) => {
  try {
    return res.sendStatus(200);
  } catch (error) {
    return next();
  }
});
router.get("/:id/", (req, res, next) => {
  try {
    return res.sendStatus(200);
  } catch (error) {
    return next();
  }
});
router.put(
  "/:id",
  [...AdminIDValidations, ...AdminUpdateStatusValidations],
  Validate,
  AdminUpdateAccountStatusController,
);
router.patch(
  "/:id/",
  [...AdminIDValidations, ...AdminUpdateStatusValidations],
  Validate,
  AdminUpdateAccountStatusController,
);
router.delete(
  "/:id",
  AdminUpdateStatusValidations,
  Validate,
  AdminUpdateAccountStatusController,
);

module.exports = router;
