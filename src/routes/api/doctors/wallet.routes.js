const router = require("express").Router();
const {
  GetDoctorWalletController,
  UpdateWalletPinController,
  RequestWithdrawalController,
} = require("../../../controllers/doctors/wallet.controller");
const { Validate } = require("../../../validations/validate");
// const { limiter: rateLimit } = require("../../../utils/rate-limit.utils");
const {
  walletWithdrawalValidations,
  walletPinValidation,
} = require("../../../validations/doctors/wallet.validations");
// rateLimit(router);
router.get("/", GetDoctorWalletController);
router.post(
  "/withdrawal",
  walletWithdrawalValidations,
  Validate,
  RequestWithdrawalController,
);
router.patch("/", walletPinValidation, Validate, UpdateWalletPinController);

module.exports = router;
