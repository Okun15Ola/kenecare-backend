const router = require("express").Router();
const { Validate } = require("../../../validations/validate");
const {
  AdminUpdateAccountStatusController,
} = require("../../../controllers/admin/auth.admin.controller");
const {
  AdminUpdateStatusValidations,
} = require("../../../validations/auth.admin.validations");

router.get("/", (req, res, next) => {
  try {
    return res.sendStatus(200);
  } catch (error) {}
});
router.get("/:id/", (req, res, next) => {
  try {
    return res.sendStatus(200);
  } catch (error) {}
});
router.put(
  "/:id",
  AdminUpdateStatusValidations,
  Validate,
  AdminUpdateAccountStatusController
);
router.patch(
  "/:id/",
  AdminUpdateStatusValidations,
  Validate,
  AdminUpdateAccountStatusController
);
router.delete(
  "/:id",
  AdminUpdateStatusValidations,
  Validate,
  AdminUpdateAccountStatusController
);

module.exports = router;
