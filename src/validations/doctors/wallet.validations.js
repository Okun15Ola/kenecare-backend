const { body } = require("express-validator");
const moment = require("moment");
const { getDoctorByUserId } = require("../../repository/doctors.repository");
const {
  getWalletByDoctorId,
  getWithdrawalRequestByDoctorIdAndDate,
} = require("../../repository/doctor-wallet.repository");
const {
  comparePassword,
  getMNC,
  AFRICELL_MNC,
  ORANGE_MNC,
  isWeakPin,
} = require("../../utils/auth.utils");
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
    .isLength({ min: 4, max: 4 })
    .withMessage("PIN must be 4 digits")
    .matches(/^[0-9]{4}$/)
    .withMessage("PIN must be numeric")
    .custom(async (value, { req }) => {
      if (value === "1234") {
        throw new Error("Default PIN not allowed. Please update it.");
      }
      const isMatch = await comparePassword({
        plainPassword: value,
        hashedPassword: req.wallet.wallet_pin,
      });
      if (!isMatch) throw new Error("Incorrect PIN.");
      return true;
    }),
  body("amount")
    .notEmpty()
    .withMessage("Amount is required")
    .isInt({ gt: 99, lt: 5001 })
    .withMessage("Withdrawal amount must be between NLE 100 and NLE 5,000")
    .custom(async (value, { req }) => {
      const amount = parseInt(value, 10);
      const balance = parseInt(req.wallet.balance, 10);

      if (amount > balance - 10) {
        throw new Error(
          "Transaction failed. Minimum balance of NLE 10 must remain in your account.",
        );
      }

      // Daily + monthly limits
      const today = moment().format("YYYY-MM-DD");
      const requestsToday = await getWithdrawalRequestByDoctorIdAndDate({
        doctorId: req.doctor.doctor_id,
        date: today,
      });
      const totalToday = requestsToday.reduce((sum, r) => sum + r.amount, 0);
      if (totalToday + amount > 5000) {
        throw new Error("Exceeded daily limit of NLE 5,000");
      }

      return true;
    }),
  body("paymentMethod")
    .notEmpty()
    .withMessage("Payment Method is required")
    .toLowerCase()
    .isIn([MOMO_PROVIDERS.ORANGE_MONEY, MOMO_PROVIDERS.AFRI_MONEY])
    .withMessage("Invalid Mobile Money Provider"),
  body("mobileMoneyNumber")
    .notEmpty()
    .withMessage("Mobile Number is required")
    .bail()
    .trim()
    .matches(/^(\+232|232|0)\d{8}$/)
    .withMessage("Invalid Sierra Leonean mobile number format.")
    .bail()
    .custom((value, { req }) => {
      const provider = req.body.paymentMethod;
      const mnc = getMNC(value);

      if (provider === MOMO_PROVIDERS.ORANGE_MONEY) {
        if (!ORANGE_MNC.includes(mnc)) {
          throw new Error(
            `Orange Money numbers must be one of: ${ORANGE_MNC.join(", ")}`,
          );
        }
      }

      if (provider === MOMO_PROVIDERS.AFRI_MONEY) {
        if (!AFRICELL_MNC.includes(mnc)) {
          throw new Error(
            `Afri Money numbers must be one of: ${AFRICELL_MNC.join(", ")}`,
          );
        }
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
    .withMessage("New PIN is required")
    .bail()
    .trim()
    .escape()
    .isLength({ min: 4, max: 4 })
    .withMessage("PIN must be 4 digits long")
    .bail()
    .matches(/^\d+$/)
    .withMessage("PIN must contain only numbers")
    .bail()
    .custom((value) => {
      if (isWeakPin(value)) {
        throw new Error(
          "This PIN is too weak. Please choose a more secure PIN.",
        );
      }
      return true;
    }),
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
