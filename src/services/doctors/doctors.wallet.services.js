/* eslint-disable no-console */
const moment = require("moment");
const { getDoctorByUserId } = require("../../repository/doctors.repository");
const Response = require("../../utils/response.utils");
const {
  getWalletByDoctorId,
  getWalletById,
  createDoctorWallet,
  updateWalletPin,
  createWithDrawalRequest,
  getWithdrawalRequestByDoctorId,
  getWithdrawalRequestByDoctorIdAndDate,
} = require("../../repository/doctor-wallet.repository");
const { hashUsersPassword } = require("../../utils/auth.utils");
const { adminWithdrawalRequestEmail } = require("../../utils/email.utils");
const logger = require("../../middlewares/logger.middleware");

exports.getDoctorsWallet = async (userId) => {
  try {
    const doctor = await getDoctorByUserId(userId);
    if (!doctor) {
      logger.error(`Doctor not found for userId: ${userId}`);
      return Response.NOT_FOUND({ message: "Doctor Not Found" });
    }

    const { doctor_id: doctorId } = doctor || null;

    let wallet = await getWalletByDoctorId(doctorId);

    if (!wallet) {
      // create a new wallet automatically with default pin;
      const hashedPin = await hashUsersPassword("1234");
      const response = await createDoctorWallet({ doctorId, pin: hashedPin });

      wallet = await getWalletById(response.insertId);
      const { first_name: firstName, last_name: lastName, balance } = wallet;
      const data = {
        id: doctorId,
        doctorName: `${firstName} ${lastName}`,
        balance: parseFloat(balance),
      };
      return Response.SUCCESS({ data });
    }

    const { first_name: firstName, last_name: lastName, balance } = wallet;
    const data = {
      id: doctorId,
      doctorName: `${firstName} ${lastName}`,
      balance: parseFloat(balance),
    };
    return Response.SUCCESS({ data });
  } catch (error) {
    logger.error("getDoctorsWallet: ", error);
    throw error;
  }
};
exports.updateDoctorWalletPin = async ({ userId, newPin }) => {
  try {
    const doctor = await getDoctorByUserId(userId);
    if (!doctor) {
      logger.error(`Doctor not found for userId: ${userId}`);
      return Response.NOT_FOUND({ message: "Doctor Not Found" });
    }
    const { doctor_id: doctorId } = doctor;

    const wallet = await getWalletByDoctorId(doctorId);
    const hashedPin = await hashUsersPassword(newPin);
    if (wallet) {
      await updateWalletPin({ doctorId, pin: hashedPin });
    } else {
      await createDoctorWallet({ doctorId, pin: hashedPin });
    }

    return Response.SUCCESS({ message: "Wallet Pin Updated Successfully" });
  } catch (error) {
    logger.error("updateDoctorWalletPin: ", error);

    throw error;
  }
};
exports.requestWithdrawal = async ({
  userId,
  amount,
  paymentMethod,
  mobileMoneyNumber,
  bankName,
  accountName,
  accountNumber,
}) => {
  try {
    const doctor = await getDoctorByUserId(userId);
    if (!doctor) {
      logger.error(`Doctor not found for userId: ${userId}`);
      return Response.NOT_FOUND({ message: "Doctor Not Found" });
    }
    const {
      doctor_id: doctorId,
      first_name: firstName,
      last_name: lastName,
    } = doctor;
    const wallet = await getWalletByDoctorId(doctorId);
    if (!wallet) {
      logger.error(`Doctor's wallet not found for doctorId: ${doctorId}`);
      return Response.BAD_REQUEST({ message: "Doctor's Wallet Not Found" });
    }
    const { balance } = wallet;
    //  Check if available balance is enough to perform transaction
    const requestedWithdrawalAmount = parseFloat(amount);
    const currentBalance = parseFloat(balance);

    if (requestedWithdrawalAmount > currentBalance) {
      logger.error(
        `Insufficient balance for doctorId: ${doctorId}. Requested: ${requestedWithdrawalAmount}, Available: ${currentBalance}`,
      );
      return Response.BAD_REQUEST({
        message: "Insufficient Wallet Balance. Withdrawal Request Failed",
      });
    }

    //  check if the doctor has any request pending
    const pendingRequest = await getWithdrawalRequestByDoctorId(doctorId);

    if (pendingRequest) {
      logger.error(
        `Pending withdrawal request found for doctorId: ${doctorId}. Cannot request another withdrawal.`,
      );
      return Response.BAD_REQUEST({
        message:
          "Cannot Request Withdrawal at this moment, you have a pending request that needs approval before you can request another withdrawal",
      });
    }

    //  get all requests for today's date
    const today = moment().format("YYYY-MM-DD");
    const requestsForToday = await getWithdrawalRequestByDoctorIdAndDate({
      doctorId,
      date: today,
    });
    //  check maximum request per day
    if (requestsForToday.length >= 3) {
      logger.error(
        `Exceeded daily maximum withdrawal requests for doctorId: ${doctorId}. Requests today: ${requestsForToday.length}`,
      );
      return Response.BAD_REQUEST({
        message:
          "Exceeded Daily Maximum Withdrawal Request. Please Try Again Tomorrow",
      });
    }

    await Promise.allSettled([
      createWithDrawalRequest({
        doctorId,
        amount,
        paymentMethod,
        mobileMoneyNumber,
        bankName,
        accountName,
        accountNumber,
      }),
      adminWithdrawalRequestEmail({
        doctorName: `${firstName} ${lastName}`,
        amount,
        paymentMethod,
        mobileMoneyNumber,
        bankName,
        accountName,
        accountNumber,
      }),
    ]);

    return Response.CREATED({
      message: "Withdrawal Requested Successfully, Awaiting Approval",
    });
  } catch (error) {
    logger.error("requestWithdrawal: ", error);
    throw error;
  }
};
