/* eslint-disable no-console */
const { v4: uuidV4 } = require("uuid");
const { getDoctorByUserId } = require("../../repository/doctors.repository");
const Response = require("../../utils/response.utils");
const {
  getWalletByDoctorId,
  getWalletById,
  createDoctorWallet,
  updateWalletPin,
  updateDoctorWalletBalance,
  // createWithDrawalRequest,
  // getWithdrawalRequestByDoctorId,
} = require("../../repository/doctor-wallet.repository");
const { hashUsersPassword } = require("../../utils/auth.utils");
const {
  createWithdrawalRequest,
  getDoctorWithdrawalHistory,
  countDoctorWithdrawalHistory,
} = require("../../repository/withdrawal-requests.repository");
const { processPayout } = require("../../utils/payment.utils");
const {
  PAYMENT_PROVIDERS,
  MOMO_PROVIDERS,
  PAYMENT_METHOD,
} = require("../../utils/enum.utils");
const logger = require("../../middlewares/logger.middleware");
const { getPaginationInfo } = require("../../utils/caching.utils");
const { fetchLoggedInDoctor } = require("../../utils/helpers.utils");
const {
  mapDoctorWithdrawalHistoryRow,
} = require("../../utils/db-mapper.utils");

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
  provider,
  mobileMoneyNumber,
}) => {
  try {
    const doctor = await getDoctorByUserId(userId);
    if (!doctor) {
      logger.error(`Doctor not found for userId: ${userId}`);
      return Response.NOT_FOUND({ message: "Doctor Not Found" });
    }
    const {
      doctor_id: doctorId,
      // first_name: firstName,
      // last_name: lastName,
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
    // const pendingRequest = await getWithdrawalRequestByDoctorId(doctorId);

    // if (pendingRequest) {
    //   logger.error(
    //     `Pending withdrawal request found for doctorId: ${doctorId}. Cannot request another withdrawal.`,
    //   );
    //   return Response.BAD_REQUEST({
    //     message:
    //       "Cannot Request Withdrawal at this moment, you have a pending request that needs approval before you can request another withdrawal",
    //   });
    // }

    let momoType;
    if (provider === MOMO_PROVIDERS.ORANGE_MONEY) {
      momoType = PAYMENT_PROVIDERS.ORANGE_MONEY;
    } else if (provider === MOMO_PROVIDERS.AFRI_MONEY) {
      momoType = PAYMENT_PROVIDERS.AFRI_MONEY;
    }

    let result;
    try {
      result = await processPayout({
        amount,
        provider: momoType,
        phoneNumber: mobileMoneyNumber,
      });

      if (!result) {
        return Response.INTERNAL_SERVER_ERROR({
          message: "Withdrawal Failed",
        });
      }

      const { id, status, failureDetails } = result;

      if (status === "failed" || failureDetails) {
        const errorMessage =
          result.messages?.join(", ") || "Unknown payout failure.";
        logger.error(
          `Payout failed for doctorId: ${doctorId}. Error Code: ${failureDetails.code} Reason: ${failureDetails.message} ${errorMessage}`,
        );

        await createWithdrawalRequest({
          doctorId,
          transactionId: id,
          orderId: uuidV4(),
          amount: requestedWithdrawalAmount,
          currency: "SLE",
          paymentType: "mobile_money",
          financialAccountId: null,
          mobileMoneyProvider: provider,
          mobileNumber: mobileMoneyNumber,
          status,
          failureDetails: failureDetails.message,
        });

        return Response.INTERNAL_SERVER_ERROR({
          message: "The withdrawal request failed. Please try again.",
        });
      }
    } catch (error) {
      const apiErrorData = error.response?.data || error.message;
      logger.error(
        `API error during payout for doctorId: ${doctorId}. Details: ${JSON.stringify(apiErrorData)}`,
      );

      return Response.INTERNAL_SERVER_ERROR({
        message:
          "An unexpected error occurred while processing your request. Please try again.",
      });
    }

    const { id, source, status, payoutAmount } = result;

    if (!result) {
      return Response.INTERNAL_SERVER_ERROR({
        message: "Withdrawal Failed",
      });
    }

    const newBalance = currentBalance - requestedWithdrawalAmount;

    if (newBalance < 1) {
      return Response.BAD_REQUEST({
        message: "Insufficient balance for withdrawal request.",
      });
    }
    const results = await Promise.allSettled([
      createWithdrawalRequest({
        doctorId,
        transactionId: id,
        orderId: uuidV4(),
        amount: requestedWithdrawalAmount,
        currency: payoutAmount.currency,
        paymentType: PAYMENT_METHOD.MOBILE_MONEY,
        financialAccountId: source.financialAccountId,
        mobileMoneyProvider: provider,
        status,
        mobileNumber: mobileMoneyNumber,
      }),
      updateDoctorWalletBalance({ doctorId, amount: newBalance }),
      // TODO: send email alert to admin
    ]);

    // Check if any promises failed
    const failures = results.filter((r) => r.status === "rejected");
    if (failures.length) {
      logger.error("Withdrawal operations failed:", failures);
      console.error("Withdrawal operations failed:", failures);
      return Response.INTERNAL_SERVER_ERROR({
        message: "Withdrawal request failed, please try again.",
      });
    }

    return Response.CREATED({
      message: "Withdrawal Requested Successfully, Funds are being disbursed.",
    });
  } catch (error) {
    logger.error("requestWithdrawal: ", error);
    throw error;
  }
};

exports.getWithdrawalHistoryService = async (userId, page, limit) => {
  try {
    const { doctor_id: doctorId } = await fetchLoggedInDoctor(userId);

    if (!doctorId) {
      return Response.UNAUTHORIZED({
        message:
          "UnAuthorized Action. Please login as a doctor before proceeding",
      });
    }

    const offset = (page - 1) * limit;
    const { totalRows } = await countDoctorWithdrawalHistory(doctorId);

    if (!totalRows) {
      return Response.SUCCESS({
        message: "No doctor withdrawal history found",
        data: [],
      });
    }

    const paginationInfo = getPaginationInfo({ totalRows, limit, page });

    const data = await getDoctorWithdrawalHistory(doctorId, limit, offset);

    if (!data?.length) {
      return Response.SUCCESS({
        message: "No doctor withdrawal history found",
        data: [],
      });
    }

    const history = data.map(mapDoctorWithdrawalHistoryRow);

    return Response.SUCCESS({
      data: history,
      pagination: paginationInfo,
    });
  } catch (error) {
    logger.error("getWithdrawalHistoryService: ", error);
    throw error;
  }
};
