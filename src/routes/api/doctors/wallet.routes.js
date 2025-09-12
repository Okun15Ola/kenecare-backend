const router = require("express").Router();
const {
  GetDoctorWalletController,
  UpdateWalletPinController,
  RequestWithdrawalController,
  GetDoctorWithdrawalHistoryController,
} = require("../../../controllers/doctors/wallet.controller");
const paymentController = require("../../../controllers/payment.controller");
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
const {
  paginationValidation,
} = require("../../../validations/pagination.validations");

router.get(
  "/",
  authenticateUser,
  limiter,
  authorizeDoctor,
  GetDoctorWalletController,
);

router.get(
  "/withdrawal-history",
  authenticateUser,
  limiter,
  authorizeDoctor,
  paginationValidation,
  Validate,
  GetDoctorWithdrawalHistoryController,
);

router.post(
  "/withdrawal",
  authenticateUser,
  limiter,
  authorizeDoctor,
  walletWithdrawalValidations,
  Validate,
  RequestWithdrawalController,
);
router.patch(
  "/",
  authenticateUser,
  limiter,
  authorizeDoctor,
  walletPinValidation,
  Validate,
  UpdateWalletPinController,
);

router.post("/monimee/webhook/payout", paymentController.payoutOutHandler);

module.exports = router;
