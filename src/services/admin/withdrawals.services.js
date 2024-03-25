const moment = require("moment");
const Response = require("../../utils/response.utils");
const {
  getAllWithdrawalRequests,
  getWithdrawalRequestById,
  approveWithdrawalRequest,
  denyWithdrawalRequest,
} = require("../../db/db.withdrawal-requests");
const { getDoctorById } = require("../../db/db.doctors");
const {
  getCurrentWalletBalance,
  updateDoctorWalletBalance,
} = require("../../db/db.doctor-wallet");
const {
  withdrawalApprovedSMS,
  withdrawalDeniedSMS,
} = require("../../utils/sms.utils");

exports.getAllRequests = async () => {
  try {
    const rawData = await getAllWithdrawalRequests();
    const data = rawData.map(
      ({
        request_id: requestId,
        doctor_id: doctorId,
        first_name: fistName,
        last_name: lastName,
        request_status: requestStatus,
        requested_amount: requestedAmount,
        payment_method: paymentMethod,
        mobile_money_number: mobileMoneyNumber,
        bank_name: bankName,
        bank_account_number: bankAccountNumber,
        bank_account_name: bankAccountName,
      }) => {
        return {
          requestId,
          doctorId,
          fistName,
          lastName,
          requestStatus,
          requestedAmount,
          paymentMethod,
          mobileMoneyNumber,
          bankName,
          bankAccountNumber,
          bankAccountName,
        };
      }
    );
    return Response.SUCCESS({ data });
  } catch (error) {
    console.error("GET ALL WITHDRAWAL REQUESTS  ERROR: ", error);
    throw error;
  }
};
exports.getRequestById = async (id) => {
  try {
    const rawData = await getWithdrawalRequestById(id);
    if (!rawData) {
      return Response.NOT_FOUND({ message: "Withdrawal Request Not Found" });
    }
    const {
      request_id: requestId,
      doctor_id: doctorId,
      first_name: fistName,
      last_name: lastName,
      requested_amount: requestedAmount,
      payment_method: paymentMethod,
      mobile_money_number: mobileMoneyNumber,
      request_status: requestStatus,
      bank_name: bankName,
      bank_account_number: bankAccountNumber,
      bank_account_name: bankAccountName,
    } = rawData;
    const data = {
      requestId,
      doctorId,
      fistName,
      lastName,
      requestStatus,
      requestedAmount,
      paymentMethod,
      mobileMoneyNumber,
      bankName,
      bankAccountNumber,
      bankAccountName,
    };
    return Response.SUCCESS({ data });
  } catch (error) {
    console.error("GET WITHFRAWAL REQUEST BY ID ERROR: ", error);
    throw error;
  }
};

exports.approveRequest = async ({ requestId, userId, comment }) => {
  try {
    const rawData = await getWithdrawalRequestById(requestId);
    if (!rawData) {
      return Response.NOT_FOUND({ message: "Withdrawal Request Not Found" });
    }

    let {
      request_status: requestStatus,
      doctor_id: doctorId,
      requested_amount: requestedAmount,
    } = rawData;

    if (requestStatus === "approved") {
      return Response.NOT_MODIFIED();
    }

    let { balance: currentWalletBalance } = await getCurrentWalletBalance(
      doctorId
    );

    currentWalletBalance = parseFloat(currentWalletBalance);
    requestedAmount = parseFloat(requestedAmount);

    if (currentWalletBalance <= requestedAmount) {
      return Response.BAD_REQUEST({
        message: "Insufficient Wallet Balance. Cannot Approve Withdrawal",
      });

      //TODO send sms to doctor due to insufficient balance
    }
    const {
      first_name,
      last_name,
      mobile_number: mobileNumber,
    } = await getDoctorById(doctorId);

    const newBalance =
      parseFloat(currentWalletBalance) - parseFloat(requestedAmount);

    await Promise.allSettled([
      updateDoctorWalletBalance({
        doctorId,
        amount: parseFloat(newBalance),
      }),
      approveWithdrawalRequest({
        adminId: userId,
        withdrawalId: requestId,
        comment,
      }),
      withdrawalApprovedSMS({
        mobileNumber,
        doctorName: `${first_name} ${last_name}`,
      }),
    ]);

    //TODO send sms to doctor about approved request
    return Response.SUCCESS({
      message: "Withdrawal Request Approved Successfully",
    });
  } catch (error) {
    console.error("REQUEST WITHDRAWAL ERROR: ", error);
    throw error;
  }
};
exports.denyRequest = async ({ userId, requestId, comment }) => {
  try {
    const rawData = await getWithdrawalRequestById(requestId);
    if (!rawData) {
      return Response.NOT_FOUND({ message: "Withdrawal Request Not Found" });
    }

    const { request_status: requestStatus, doctor_id: doctorId } = rawData;
    if (requestStatus === "declined" || requestStatus === "approved") {
      return Response.NOT_MODIFIED();
    }
    const {
      first_name,
      last_name,
      mobile_number: mobileNumber,
    } = await getDoctorById(doctorId);
    await denyWithdrawalRequest({
      adminId: userId,
      withdrawalId: requestId,
      comment,
    });
    //TODO send sms to doctor about declined request
    withdrawalDeniedSMS({
      mobileNumber,
      doctorName: `${first_name} ${last_name}`,
      comment,
    });
    return Response.SUCCESS({
      message: "Withdrawal Request Declined Successfully",
    });
  } catch (error) {
    console.error("REQUEST WITHDRAWAL ERROR: ", error);
    throw error;
  }
};
