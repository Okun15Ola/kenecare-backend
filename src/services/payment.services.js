const moment = require("moment");
const {
  deleteAppointmentById,
  getAppointmentByUUID,
} = require("../repository/patientAppointments.repository");
const Response = require("../utils/response.utils");
const {
  updateAppointmentPaymentStatus,
  getAppointmentPaymentByAppointmentId,
  deleteAppointmentPaymentByAppointmentId,
} = require("../repository/payments.repository");
const { getPatientById } = require("../repository/patients.repository");
const { getDoctorById } = require("../repository/doctors.repository");
const {
  appointmentBookedSms,
  doctorAppointmentBookedSms,
} = require("../utils/sms.utils");
const {
  updateDoctorWalletBalance,
  getCurrentWalletBalance,
} = require("../repository/doctor-wallet.repository");
const { sendPushNotification } = require("../utils/notification.utils");
const { cancelPaymentUSSD } = require("../utils/payment.utils");

exports.processAppointmentPayment = async ({
  consultationId,
  referrer,
  transactionId,
  paymentEventStatus,
}) => {
  try {
    if (!consultationId || referrer !== "kenecare.com") {
      return Response.BAD_REQUEST({ message: "Error Processing Request" });
    }

    const appointment = await getAppointmentByUUID(consultationId);

    if (!appointment) {
      return Response.NOT_FOUND({ message: "Appointment Not Found" });
    }

    const {
      appointment_id: appointmentId,
      patient_id: patientId,
      first_name: userFirstName,
      last_name: userLastName,
      doctor_id: doctorId,
      patient_name_on_prescription: patientNameOnPrescription,
      // patient_mobile_number: patientMobileNumber,
      // patient_symptoms: symptoms,
      appointment_date: appointmentDate,
      appointment_time: appointmentTime,
    } = appointment;

    // check if payment event status is expired
    if (paymentEventStatus === "expired") {
      // delete the appointment and it's payment record from the database
      await Promise.all([
        deleteAppointmentPaymentByAppointmentId({ appointmentId }),
        deleteAppointmentById({ appointmentId }),
      ]);
      return Response.SUCCESS({});
    }

    const appointmentPaymentRecord =
      await getAppointmentPaymentByAppointmentId(appointmentId);

    if (!appointmentPaymentRecord) {
      return Response.BAD_REQUEST({
        message: "Error processing payment. Please try again",
      });
    }
    const {
      payment_id: paymentId,
      // order_id: orderId,
      amount_paid: amountPaid,
      // payment_token: paymentToken,
      transaction_id: transactionID,
      payment_status: paymentStatus,
    } = appointmentPaymentRecord;

    if (transactionID === null && paymentStatus === "success") {
      return Response.SUCCESS({});
    }

    if (paymentEventStatus === "success") {
      // calculate kenecare fee
      const kenecarePercentage = 0.15;
      const kenecareFee = parseFloat(amountPaid) * kenecarePercentage;
      const finalDoctorFee = parseFloat(amountPaid) - parseFloat(kenecareFee);

      const { balance: currentBalance } =
        await getCurrentWalletBalance(doctorId);

      const newAccountBalance =
        parseFloat(currentBalance) + parseFloat(finalDoctorFee);

      await Promise.allSettled([
        updateAppointmentPaymentStatus({
          paymentId,
          paymentStatus: paymentEventStatus,
          transactionId,
        }),
        updateDoctorWalletBalance({
          doctorId,
          amount: parseFloat(newAccountBalance),
        }),
      ]);

      const [doctor, patient] = await Promise.allSettled([
        getDoctorById(doctorId),
        getPatientById(patientId),
      ]);

      const {
        mobile_number: mobileNumber,
        notification_token: patientNotificationToken,
      } = patient.value;
      const {
        // email: doctorEmail,
        first_name: doctorFirstName,
        last_name: doctorLastName,
        mobile_number: doctorMobileNumber,
        notification_token: doctorNotificationToken,
      } = doctor.value;

      //  SEND PUSH NOTIFICATION TO PATIENT AND DOCTOR
      const patientNotification = {
        token: patientNotificationToken,
        title: "New Medical Appointment",
        body: `New Medical Appointment With Dr. ${doctorFirstName}`,
        payload: {
          appointmentId,
        },
      };
      const doctorNotification = {
        token: doctorNotificationToken,
        title: "New Medical Appointment",
        body: `New Medical Apponintment With ${userFirstName}`,
        payload: {
          appointmentId,
        },
      };

      await Promise.allSettled([
        //  SEND SMS AND PUSH NOTIFICATION TO DOCTOR
        doctorAppointmentBookedSms({
          mobileNumber: doctorMobileNumber,
          doctorName: `${doctorLastName}`,
          patientNameOnPrescription,
          appointmentDate: moment(appointmentDate).format("YYYY-MM-DD"),
          appointmentTime,
        }),
        await sendPushNotification(doctorNotification),

        // SEND SMS and PUSH NOTIFICATIN TO PATIENT
        await appointmentBookedSms({
          mobileNumber,
          patientName: `${userFirstName} ${userLastName}`,
          doctorName: `${doctorFirstName} ${doctorLastName}`,
          patientNameOnPrescription,
          appointmentDate: moment(appointmentDate).format("YYYY-MM-DD"),
          appointmentTime,
        }),
        await sendPushNotification(patientNotification),
      ]);
    }

    return Response.SUCCESS({});
  } catch (error) {
    console.error(error);
    throw error;
  }
};
exports.cancelAppointmentPayment = async ({ consultationId, referrer }) => {
  try {
    if (!consultationId || referrer !== "kenecare.com") {
      return Response.BAD_REQUEST({ message: "Error Processing Request" });
    }

    //  Check if the user canelling the payment is the authorized user that booked the appointment

    // Get appointment by UUID
    const rawData = await getAppointmentByUUID(consultationId);

    // Check if the appointment exists
    if (!rawData) {
      return Response.NOT_FOUND({
        message: "Medical Appointment Not Found.",
      });
    }

    const { appointment_id: appointmentId } = rawData;

    const payment = await getAppointmentPaymentByAppointmentId(appointmentId);

    if (!payment) {
      return Response.BAD_REQUEST({
        message: "Error processing payment. Please try again",
      });
    }

    const {
      // payment_id: paymentId,
      // order_id: orderId,
      // amount_paid: amountPaid,
      // payment_token: paymentToken,
      transaction_id: transactionID,
      payment_status: paymentStatus,
    } = payment;

    if (transactionID !== null && paymentStatus === "success") {
      return Response.NO_CONTENT({});
    }

    // Delete the apppointment and appointment payment from the database if payment was not successful
    await Promise.all([
      deleteAppointmentPaymentByAppointmentId({ appointmentId }),
      deleteAppointmentById({ appointmentId }),
      cancelPaymentUSSD(transactionID),
    ]);
    return Response.SUCCESS({
      message: "Medical Appointment Cancelled Successfully.",
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
