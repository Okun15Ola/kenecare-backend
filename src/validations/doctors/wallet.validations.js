const { body } = require("express-validator");
const moment = require("moment");
const { getDoctorByUserId } = require("../../repository/doctors.repository");
const {
  getWalletByDoctorId,
  getWithdrawalRequestByDoctorIdAndDate,
} = require("../../repository/doctor-wallet.repository");
const { comparePassword } = require("../../utils/auth.utils");
const { MOMO_PROVIDERS } = require("../../utils/enum.utils");

exports.walletWithdrawalValidations = [
  async (req, res, next) => {
    try {
      const doctor = await getDoctorByUserId(req.user.id);
      if (!doctor) {
        return res.status(404).json({ message: "Doctor Not Found" });
      }
      const wallet = await getWalletByDoctorId(doctor.doctor_id);
      if (!wallet) {
        return res.status(400).json({ message: "Doctor's Wallet Not Found" });
      }

      req.doctor = doctor;
      req.wallet = wallet;
      return next();
    } catch (error) {
      return next(error);
    }
  },
  body("pin")
    .notEmpty()
    .withMessage("Wallet PIN is required")
    .bail()
    .isLength({ min: 4, max: 4 })
    .withMessage("PIN must be exactly 4 digits")
    .bail()
    .matches(/^\d+$/)
    .withMessage("PIN must be a number")
    .bail()
    .custom(async (value, { req }) => {
      const { wallet_pin: walletPin } = req.wallet;

      if (value === 1234 || value === "1234") {
        throw new Error(
          "Cannot Request Withdrawal with default wallet pin. Please update wallet PIN before proceeding.",
        );
      }

      const isMatch = await comparePassword({
        plainPassword: value,
        hashedPassword: walletPin,
      });

      if (!isMatch) {
        throw new Error("Incorrect Wallet PIN. Please try again.");
      }
      return true;
    }),
  body("amount")
    .notEmpty()
    .withMessage("Withdrawal amount is required")
    .bail()
    .isNumeric({ no_symbols: true })
    .withMessage("Withdrawal amount must be a number")
    .bail()
    .isInt({ gt: 100, lt: 51000 })
    .withMessage("Withdrawal Amount Must be between NLE 100 and NLE 50,000")
    .bail()
    .custom(async (value, { req }) => {
      const requestedAmount = parseFloat(value);
      const currentBalance = parseFloat(req.wallet.balance);

      if (requestedAmount > currentBalance) {
        throw new Error("Insufficient Balance to request withdrawal");
      }

      const today = moment().format("YYYY-MM-DD");
      const requestsForToday = await getWithdrawalRequestByDoctorIdAndDate({
        doctorId: req.doctor.doctor_id,
        date: today,
      });

      const totalToday = requestsForToday.reduce(
        (sum, req) => sum + req.amount,
        0,
      );
      const totalRequested = totalToday + requestedAmount;
      const dailyLimit = 50000;

      if (totalRequested > dailyLimit) {
        throw new Error("Exceeded daily withdrawal limit.");
      }

      return true;
    }),
  body("paymentMethod")
    .notEmpty({ ignore_whitespace: false })
    .withMessage("Payment Method is required")
    .bail()
    .trim()
    .toLowerCase()
    .isIn([MOMO_PROVIDERS.ORANGE_MONEY, MOMO_PROVIDERS.AFRI_MONEY])
    .withMessage(
      `Payment method must be one of: ${MOMO_PROVIDERS.ORANGE_MONEY} or ${MOMO_PROVIDERS.AFRI_MONEY}`,
    )
    .bail()
    .custom((value, { req }) => {
      if (!req.body.mobileMoneyNumber) {
        throw new Error(
          "Mobile Money Number is required for this payment method.",
        );
      }
      return true;
    }),
  body("mobileMoneyNumber")
    .notEmpty()
    .withMessage("Mobile Number is required")
    .bail()
    .trim()
    .matches(/^(07\d|088|099|0\d{2})\d{6}$/) // TODO: enhance check to accept only africell or orange  number
    .withMessage("Invalid Sierra Leonean mobile number format.")
    .custom((value, { req }) => {
      // Cross-validation: check if the number matches the selected provider.
      const provider = req.body.paymentMethod;
      if (
        provider === MOMO_PROVIDERS.ORANGE_MONEY &&
        !value.startsWith("07") &&
        !value.startsWith("088")
      ) {
        throw new Error("Orange Money numbers must start with 07 or 088.");
      }
      if (provider === MOMO_PROVIDERS.AFRI_MONEY && !value.startsWith("099")) {
        throw new Error("Afri Money numbers must start with 099.");
      }
      return true;
    }),
];

exports.walletPinValidation = [
  body("currentPin")
    .notEmpty()
    .withMessage("Current Wallet Pin is required")
    .bail()
    .isLength({ min: 4, max: 4 })
    .withMessage("Wallet PIN must be 4-digits long")
    .bail()
    .trim()
    .escape()
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
    .bail()
    .trim()
    .escape()
    .isLength({ min: 4, max: 4 })
    .withMessage("PIN must be 4-digits long"),
  body("confirmNewPin")
    .notEmpty()
    .withMessage("Confirm Pin is required")
    .bail()
    .custom(async (pin, { req }) => {
      if (req.body.newPin !== pin) {
        throw new Error("PIN don't match");
      }
      return true;
    }),
];
