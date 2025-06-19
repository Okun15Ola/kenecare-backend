const Response = require("../../utils/response.utils");
const {
  getAllWithdrawalRequests,
  getWithdrawalRequestById,
  approveWithdrawalRequest,
  denyWithdrawalRequest,
} = require("../../repository/withdrawal-requests.repository");
const { getDoctorById } = require("../../repository/doctors.repository");
const {
  getCurrentWalletBalance,
  updateDoctorWalletBalance,
} = require("../../repository/doctor-wallet.repository");
const {
  withdrawalApprovedSMS,
  withdrawalDeniedSMS,
} = require("../../utils/sms.utils");
const { mapWithdawalRow } = require("../../utils/db-mapper.utils");

exports.getAllRequests = async () => {
  try {
    const rawData = await getAllWithdrawalRequests();
    if (!rawData) {
      return Response.NOT_FOUND({ message: "Withdrawal Request Not Found" });
    }
    const data = rawData.map(mapWithdawalRow);
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
    const data = mapWithdawalRow(rawData);
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

    const {
      request_status: requestStatus,
      doctor_id: doctorId,
      requested_amount: requestedAmount,
    } = rawData;

    if (requestStatus === "approved") {
      return Response.NOT_MODIFIED();
    }

    let { balance: currentWalletBalance } =
      await getCurrentWalletBalance(doctorId);

    currentWalletBalance = parseFloat(currentWalletBalance);
    const parsedRequestedAmount = parseFloat(requestedAmount);

    if (currentWalletBalance <= parsedRequestedAmount) {
      return Response.BAD_REQUEST({
        message: "Insufficient Wallet Balance. Cannot Approve Withdrawal",
      });

      //  send sms to doctor due to insufficient balance
    }
    const {
      first_name: doctorFirstName,
      last_name: doctorLastName,
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
        doctorName: `${doctorFirstName} ${doctorLastName}`,
      }),
    ]);

    //  send sms to doctor about approved request
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
      first_name: doctorFirstName,
      last_name: doctorLastName,
      mobile_number: mobileNumber,
    } = await getDoctorById(doctorId);
    await denyWithdrawalRequest({
      adminId: userId,
      withdrawalId: requestId,
      comment,
    });
    //  send sms to doctor about declined request
    withdrawalDeniedSMS({
      mobileNumber,
      doctorName: `${doctorFirstName} ${doctorLastName}`,
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
