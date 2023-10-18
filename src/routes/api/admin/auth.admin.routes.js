const path = require("path");
const router = require("express").Router();
const logger = require("../../../middlewares/logger.middleware");
const { Validate } = require("../../../validations/validate");
const {
  AdminLoginController,
  AdminRegisterController,
  AdminUpdateAccountStatusController,
} = require("../../../controllers/admin/auth.admin.controller");
const {
  AdminLoginValidations,
  AdminRegisterValidations,
  AdminUpdateStatusValidations,
} = require("../../../validations/auth.admin.validations");

router.get("/authenticate", (req, res, next) => {
  try {
    console.log("Authenticated");
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
});
router.post("/login", AdminLoginValidations, Validate, AdminLoginController);

router.post(
  "/register",
  AdminRegisterValidations,
  Validate,
  AdminRegisterController
);
// router.put(
//   "/accounts/:id/",
//   AdminUpdateStatusValidations,
//   Validate,
//   AdminUpdateAccountStatusController
// );

module.exports = router;
