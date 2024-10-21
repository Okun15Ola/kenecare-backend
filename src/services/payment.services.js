const moment = require("moment");
const {
  getPatientAppointmentByUUID,
  deleteAppointmentById,
  getAppointmentByUUID,
} = require("../db/db.appointments.patients");

const Response = require("../utils/response.utils");

// const { newDoctorAppointmentEmail } = require("../utils/email.utils");
const {
  updateAppointmentPaymentStatus,
  getAppointmentPaymentByAppointmentId,
  deleteAppointmentPaymentByAppointmentId,
} = require("../db/db.payments");
const { checkTransactionStatus } = require("../utils/payment.utils");
const { getPatientById } = require("../db/db.patients");
const { getDoctorById } = require("../db/db.doctors");
const {
  appointmentBookedSms,
  doctorAppointmentBookedSms,
} = require("../utils/sms.utils");
const {
  updateDoctorWalletBalance,
  getCurrentWalletBalance,
} = require("../db/db.doctor-wallet");
const { sendPushNotification } = require("../utils/notification.utils");

exports.processAppointmentPayment = async ({ consultationId, referrer }) => {
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

    const appointmentPaymentRecord =
      await getAppointmentPaymentByAppointmentId(appointmentId);

    if (!appointmentPaymentRecord) {
      return Response.BAD_REQUEST({
        message: "Error processing payment. Please try again",
      });
    }
    const {
      payment_id: paymentId,
      order_id: orderId,
      amount_paid: amountPaid,
      payment_token: paymentToken,
      transaction_id: transactionID,
      payment_status: paymentStatus,
    } = appointmentPaymentRecord;

    if (transactionID !== null && paymentStatus === "success") {
      return Response.NOT_MODIFIED();
    }

    const { status, txnid: transactionId } = await checkTransactionStatus({
      orderId,
      amount: amountPaid,
      payToken: paymentToken,
    });

    if (status !== "SUCCESS") {
      return Response.BAD_REQUEST({
        message: "Processing Payment Failed. Please try again",
      });
    }

    // calculate kenecare fee
    const kenecarePercentage = 0.15;
    const kenecareFee = parseFloat(amountPaid) * kenecarePercentage;
    const finalDoctorFee = parseFloat(amountPaid) - parseFloat(kenecareFee);

    const { balance: currentBalance } = await getCurrentWalletBalance(doctorId);

    const newAccountBalance =
      parseFloat(currentBalance) + parseFloat(finalDoctorFee);

    await Promise.allSettled([
      updateAppointmentPaymentStatus({
        paymentId,
        paymentStatus: status.toLowerCase(),
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
      // SEND  EMAIL TO DOCTOR
      // await newDoctorAppointmentEmail({
      //   doctorEmail,
      //   doctorName: `${doctorFirstName} ${doctorLastName}`,
      //   appointmentDate,
      //   appointmentTime,
      //   patientNameOnPrescription,
      //   patientMobileNumber,
      //   symptoms,
      // }),

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

    return Response.CREATED({
      message:
        "Appointment Created Successfully. A confirmation SMS has been sent.",
    });
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
    const rawData = await getPatientAppointmentByUUID(consultationId);
    // Check if the appointment exists
    if (!rawData) {
      return Response.BAD_REQUEST({
        message: "Medical Appointment Not Found.",
      });
    }

    const { appointment_id: appointmentId } = rawData;

    const {
      payment_id: paymentId,
      // order_id: orderId,
      // amount_paid: amountPaid,
      // payment_token: paymentToken,
      transaction_id: transactionID,
      payment_status: paymentStatus,
    } = await getAppointmentPaymentByAppointmentId(appointmentId);

    if (!paymentId) {
      return Response.BAD_REQUEST({
        message: "Error processing payment. Please try again",
      });
    }

    if (transactionID !== null && paymentStatus === "success") {
      return Response.NOT_MODIFIED();
    }

    // Delete the apppointment and appointment paymetn from the database
    await Promise.all([
      deleteAppointmentPaymentByAppointmentId({ appointmentId }),
      deleteAppointmentById({ appointmentId }),
    ]);

    return Response.SUCCESS({
      message: "Medical Appointment Cancelled Successfully.",
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
