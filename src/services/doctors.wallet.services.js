const { getDoctorByUserId } = require("../db/db.doctors");
const Response = require("../utils/response.utils");
const { USERTYPE, STATUS, VERIFICATIONSTATUS } = require("../utils/enum.utils");
const {
  getWalletByDoctorId,
  getWalletById,
  createDoctorWallet,
  updateWalletPin,
  createWithDrawalRequest,
  getWithdrawalRequestByDoctorId,
  getWithdrawalRequestByDoctorIdAndDate,
} = require("../db/db.doctor-wallet");
const { comparePassword, hashUsersPassword } = require("../utils/auth.utils");
const { adminWithdrawalRequestEmail } = require("../utils/email.utils");
const moment = require("moment");

exports.getDoctorsWallet = async (userId) => {
  try {
    const doctor = await getDoctorByUserId(userId);
    if (!doctor) {
      return Response.NOT_FOUND({ message: "Doctor Not Found" });
    }

    const { doctor_id: doctorId } = doctor || null;

    let wallet = await getWalletByDoctorId(doctorId);

    if (!wallet) {
      //create a new wallet automatically with default pin;
      const hashedPin = await hashUsersPassword("1234");
      const response = await createDoctorWallet({ doctorId, pin: hashedPin });

      wallet = await getWalletById(response.insertid);
      const {
        doctor_id,
        first_name: firstName,
        last_name: lastName,
        balance,
      } = wallet;
      const data = {
        id: doctor_id,
        doctorName: `${firstName} ${lastName}`,
        balance: parseFloat(balance),
      };
      return Response.SUCCESS({ data });
    } else {
      const {
        doctor_id,
        first_name: firstName,
        last_name: lastName,
        balance,
      } = wallet;
      const data = {
        id: doctor_id,
        doctorName: `${firstName} ${lastName}`,
        balance: parseFloat(balance),
      };
      return Response.SUCCESS({ data });
    }
  } catch (error) {
    console.error("GET DOCTORS WALLET ERROR: ", error);
    throw error;
  }
};
exports.updateDoctorWalletPin = async ({ userId, newPin }) => {
  try {
    const doctor = await getDoctorByUserId(userId);
    if (!doctor) {
      return Response.NOT_FOUND({ message: "Doctor Not Found" });
    }
    const { doctor_id: doctorId } = doctor;

    let wallet = await getWalletByDoctorId(doctorId);
    const hashedPin = await hashUsersPassword(newPin);
    if (wallet) {
      await updateWalletPin({ doctorId, pin: hashedPin });
    } else {
      await createDoctorWallet({ doctorId, pin: hashedPin });
    }

    return Response.SUCCESS({ message: "Wallet Pin Updated Successfully" });
  } catch (error) {
    console.error("UPDATE WALLET PIN ERROR: ", error);
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
      return Response.NOT_FOUND({ message: "Doctor Not Found" });
    }
    const {
      doctor_id: doctorId,
      first_name: firstName,
      last_name: lastName,
    } = doctor;
    const wallet = await getWalletByDoctorId(doctorId);
    if (wallet) {
      let { balance } = wallet;
      //Check if available balance is enough to perform transaction
      amount = parseFloat(amount);
      balance = parseFloat(balance);

      if (amount > balance) {
        return Response.BAD_REQUEST({
          message: "Insufficient Wallet Balance. Withdrawal Request Failed",
        });
      }

      //check if the doctor has any request pending
      const pendingRequest = await getWithdrawalRequestByDoctorId(doctorId);

      if (pendingRequest) {
        console.log(pendingRequest);
        console.log(moment());
        return Response.BAD_REQUEST({
          message:
            "Cannot Request Withdrawal at this moment, you have a pending request that needs approval before you can request another withdrawal",
        });
      }

      //get all requests for today's date
      const today = moment().format("YYYY-MM-DD");
      const requestsForToday = await getWithdrawalRequestByDoctorIdAndDate({
        doctorId,
        date: today,
      });
      //check maximum request per day
      if (requestsForToday.length >= 3) {
        return Response.BAD_REQUEST({
          message:
            "Exceeded Daily Maximum Withdrawal Request. Please Try Again Tomorrow",
        });
      }

      const [requestCreated, emailSent] = await Promise.allSettled([
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

      console.log("REQUEST CREATED: ", requestCreated);
      console.log("EMAIL SENT: ", emailSent);
      return Response.CREATED({
        message: "Withdrawal Requested Successfully, Awaiting Approval",
      });
    }
  } catch (error) {
    console.error("REQUEST WITHDRAWAL ERROR: ", error);
    throw error;
  }
};
