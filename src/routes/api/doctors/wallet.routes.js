const router = require("express").Router();
const {
  GetDoctorWalletController,
  UpdateWalletPinController,
  RequestWithdrawalController,
} = require("../../../controllers/doctors/wallet.controller");
const { Validate } = require("../../../validations/validate");
const {
  walletWithdrawalValidations,
  walletPinValidation,
} = require("../../../validations/doctors/wallet.validations");
const { limiter } = require("../../../utils/rate-limit.utils");
const {
  authenticateUser,
  authorizeDoctor,
} = require("../../../middlewares/auth.middleware");

router.use(authenticateUser, limiter, authorizeDoctor); // Authentication middleware & Rate limiting middleware applied to all routes in this router

router.get("/", GetDoctorWalletController);
router.post(
  "/withdrawal",
  walletWithdrawalValidations,
  Validate,
  RequestWithdrawalController,
);
router.patch("/", walletPinValidation, Validate, UpdateWalletPinController);

module.exports = router;
