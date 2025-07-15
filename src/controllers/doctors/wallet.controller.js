const logger = require("../../middlewares/logger.middleware");
const {
  getDoctorsWallet,
  updateDoctorWalletPin,
  requestWithdrawal,
} = require("../../services/doctors/doctors.wallet.services");

const GetDoctorWalletController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id, 10);
    const response = await getDoctorsWallet(userId);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};
const UpdateWalletPinController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id, 10);
    const { newPin } = req.body;
    const response = await updateDoctorWalletPin({
      userId,
      newPin,
    });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

const RequestWithdrawalController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id, 10);
    const {
      amount,
      paymentMethod,
      mobileMoneyNumber,
      bankName,
      accountName,
      accountNumber,
    } = req.body;

    const response = await requestWithdrawal({
      userId,
      amount: parseFloat(amount),
      paymentMethod,
      mobileMoneyNumber,
      bankName,
      accountName,
      accountNumber,
    });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

module.exports = {
  GetDoctorWalletController,
  UpdateWalletPinController,
  RequestWithdrawalController,
};
