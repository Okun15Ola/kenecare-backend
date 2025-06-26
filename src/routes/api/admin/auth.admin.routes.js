const router = require("express").Router();
const { Validate } = require("../../../validations/validate");
const {
  AdminLoginController,
  AdminRegisterController,
  AuthenticateController,
} = require("../../../controllers/admin/auth.admin.controller");
const {
  AdminLoginValidations,
  AdminRegisterValidations,
} = require("../../../validations/auth.admin.validations");

router.get("/authenticate", AuthenticateController);
router.post("/login", AdminLoginValidations, Validate, AdminLoginController);

router.post(
  "/register",
  AdminRegisterValidations,
  Validate,
  AdminRegisterController,
);

module.exports = router;
