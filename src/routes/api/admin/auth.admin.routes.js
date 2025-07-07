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
const { authLimiter } = require("../../../utils/rate-limit.utils");

router.use(authLimiter); // Rate limiting middleware applied to all routes in this router
router.get("/authenticate", AuthenticateController);
router.post("/login", AdminLoginValidations, Validate, AdminLoginController);

router.post(
  "/register",
  AdminRegisterValidations,
  Validate,
  AdminRegisterController,
);

module.exports = router;
