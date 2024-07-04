const router = require("express").Router();
const { body } = require("express-validator");
const {
  GetDoctorWalletController,
  UpdateWalletPinController,
  RequestWithdrawalController,
} = require("../../../controllers/doctors/wallet.controller");
const { Validate } = require("../../../validations/validate");
// const { limiter: rateLimit } = require("../../../utils/rate-limit.utils");
const { getDoctorByUserId } = require("../../../db/db.doctors");
const { getWalletByDoctorId } = require("../../../db/db.doctor-wallet");
const { comparePassword } = require("../../../utils/auth.utils");

// rateLimit(router);
router.get("/", GetDoctorWalletController);
router.post(
  "/withdrawal",
  [
    body("pin")
      .notEmpty()
      .withMessage("PIN is required")
      .isInt({ allow_leading_zeroes: false })
      .trim()
      .escape()
      .custom(async (value, { req }) => {
        const doctor = await getDoctorByUserId(req.user.id);
        if (!doctor) {
          throw new Error("Doctor Not Found");
        }
        const { doctor_id: doctorId } = doctor || null;
        const wallet = await getWalletByDoctorId(doctorId);
        if (!wallet) {
          throw new Error("Doctor's Wallet Not Found");
        }
        if (value === 1234) {
          throw new Error(
            "Cannot Request Withdrawal with default wallet pin. Please update wallet PIN before proceeding.",
          );
        }
        const { wallet_pin: walletPin } = wallet || null;
        const isMatch = await comparePassword({
          plainPassword: value,
          hashedPassword: walletPin,
        });
        if (!isMatch) {
          throw new Error("Incorrect Wallet PIN. Please Try again");
        }
        return true;
      }),
    body("amount")
      .notEmpty()
      .withMessage("Withdrawal amount is required")
      .isNumeric({ no_symbols: true })
      .isInt({ lt: 51000, gt: 99 })
      .withMessage("Withdrawal Amount Must be between NLE 100 - NLE 50,000")
      .custom(async (value, { req }) => {
        const doctor = await getDoctorByUserId(req.user.id);
        if (!doctor) {
          throw new Error("Doctor Not Found");
        }
        const { doctor_id: doctorId } = doctor || null;
        const wallet = await getWalletByDoctorId(doctorId);
        const { balance } = wallet || null;

        const requestedAmount = parseFloat(value);
        const currentBalance = parseFloat(balance);
        if (requestedAmount > currentBalance) {
          throw new Error("Insufficient Balance to request withdrawal");
        }

        return true;
      }),
    body("paymentMethod")
      .notEmpty({ ignore_whitespace: false })
      .withMessage("Payment Method is required")
      .trim()
      .toLowerCase()
      .escape()
      .custom(async (value, { req }) => {
        if (value !== "orange_money" || value !== "bank_transfer") {
          throw new Error("Invalid payment method");
        }
        if (value === "orange_money" && req.body.mobileMoneyNumber === "") {
          throw new Error(
            "Please specify Mobile Money Number for Orange Money Payment",
          );
        }
        if (
          (value === "bank_transfer" && req.body.bankName === "") ||
          req.body.accountName === "" ||
          req.body.accountNumber === ""
        ) {
          throw new Error("Please specify bank details for bank transfer");
        }
        return true;
      }),

    body("bankName").escape().trim(),
    body("accountName").escape().trim(),
    body("accountNumber").escape().trim(),
  ],
  Validate,
  RequestWithdrawalController,
);
router.patch(
  "/",
  [
    body("currentPin")
      .notEmpty()
      .withMessage("Current Pin is required")
      .isLength({ min: 4, max: 4 })
      .withMessage("PIN must be 4-digits long")
      .custom(async (value, { req }) => {
        const { id } = req.user;
        const doctor = await getDoctorByUserId(id);
        if (!doctor) {
          throw new Error("Doctor Not Found");
        }
        const pin = value;

        const { doctor_id: doctorId } = doctor;
        const wallet = await getWalletByDoctorId(doctorId);
        const { wallet_pin: walletPin } = wallet || null;

        const isMatch = await comparePassword({
          plainPassword: pin,
          hashedPassword: walletPin,
        });
        if (!isMatch) {
          throw new Error("Incorrect Current PIN");
        }
        return true;
      }),
    body("newPin")
      .notEmpty()
      .withMessage("New Pin is required")
      .trim()
      .escape()
      .isLength({ min: 4, max: 4 })
      .withMessage("PIN must be 4-digits long"),
    body("confirmNewPin")
      .notEmpty()
      .withMessage("Confirm Pin is required")
      .custom(async (pin, { req }) => {
        if (req.body.newPin !== pin) {
          throw new Error("PIN don't match");
        }
        return true;
      }),
  ],
  Validate,
  UpdateWalletPinController,
);

module.exports = router;
