const moment = require("moment");
const {
  getPatientAppointmentByUUID,
  deleteAppointmentById,
} = require("../db/db.appointments.patients");
const {
  paymentCanceledPatientAppointmentEmail,
} = require("../utils/email.utils");
const Response = require("../utils/response.utils");

const {
  newPatientAppointmentEmail,
  newDoctorAppointmentEmail,
} = require("../utils/email.utils");
const {
  updateAppointmentPaymentStatus,
  getAppointmentPaymentByAppointmentId,
  deleteAppointmentPaymentByAppointmentId,
} = require("../db/db.payments");
const { checkTransactionStatus } = require("../utils/payment.utils");
const { getUserById } = require("../db/db.users");
const { getPatientByUserId } = require("../db/db.patients");
const { getDoctorById } = require("../db/db.doctors");

exports.processAppointmentPayment = async ({
  userId,
  consultationId,
  referrer,
}) => {
  try {
    if (!consultationId || referrer !== "kenecare.com") {
      return Response.BAD_REQUEST({ message: "Error Processing Request" });
    }

    //TODO check if the user is the authorized user making the payment

    const {
      appointment_id: appointmentId,
      first_name: userFirstName,
      last_name: userLastName,
      doctor_id: doctorId,
      patient_name_on_prescription: patientNameOnPrescription,
      patient_mobile_number: patientMobileNumber,
      patient_symptoms: symptoms,
      speciality_name: specialty,
      appointment_date: appointmentDate,
      appointment_time: appointmentTime,
    } = await getPatientAppointmentByUUID(consultationId);

    if (!appointmentId) {
      return Response.NOT_FOUND({ message: "Medical Appointment Not Found." });
    }

    const {
      payment_id: paymentId,
      order_id: orderId,
      amount_paid: amountPaid,
      payment_token: paymentToken,
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

    const { status, txnid: transactionId } = await checkTransactionStatus({
      orderId,
      amount: amountPaid,
      payToken: paymentToken,
    });

    if (status !== "SUCCESS") {
      return Response.BAD_REQUEST({
        message: "Payment Failed. Please try again",
      });
    }

    //TODO Update appointment payment status
    await updateAppointmentPaymentStatus({
      paymentId,
      paymentStatus: status.toLowerCase(),
      transactionId,
    });

    const [patient, user, doctor] = await Promise.all([
      getPatientByUserId(userId),
      getUserById(userId),
      getDoctorById(doctorId),
    ]);

    const { email: patientEmail } = user;
    const {
      first_name: doctorFirstName,
      last_name: doctorLastName,
      email: doctorEmail,
    } = doctor;

    //DONE Send email notification to doctor and patient
    if (patientEmail) {
      await Promise.allSettled([
        newPatientAppointmentEmail({
          patientName: `${userFirstName} ${userLastName}`,
          patientEmail,
          appointmentDate: moment(appointmentDate).format("YYYY-MM-DD"),
          appointmentTime,
          doctorName: `${doctorFirstName} ${doctorLastName}`,
          patientNameOnPrescription,
        }),
        await newDoctorAppointmentEmail({
          doctorEmail,
          doctorName: `${doctorFirstName} ${doctorLastName}`,
          appointmentDate: moment(appointmentDate).format("YYYY-MM-DD"),
          appointmentTime,
          patientNameOnPrescription,
          patientMobileNumber,
          symptoms,
        }),
      ]);
    } else {
      //send email to doctor
      await newDoctorAppointmentEmail({
        doctorEmail,
        doctorName: `${doctorFirstName} ${doctorLastName}`,
        appointmentDate,
        appointmentTime,
        symptoms,
      });
    }

    return Response.CREATED({
      message:
        "Appointment Created Successfully. A confirmation email has been sent.",
    });
  } catch (error) {
    throw error;
  }
};
exports.cancelAppointmentPayment = async ({ consultationId, referrer }) => {
  try {
    if (!consultationId || referrer !== "kenecare.com") {
      return Response.BAD_REQUEST({ message: "Error Processing Request" });
    }

    //TODO Check if the user canelling the payment is the authorized user that booked the appointment

    //Get appointment by UUID
    const rawData = await getPatientAppointmentByUUID(consultationId);
    //Check if the appointment exists
    if (!rawData) {
      return Response.BAD_REQUEST({
        message: "Medical Appointment Not Found.",
      });
    }

    const { appointment_id: appointmentId } = rawData;

    const {
      payment_id: paymentId,
      order_id: orderId,
      amount_paid: amountPaid,
      payment_token: paymentToken,
      transaction_id: transactionID,
      payment_status: paymentStatus,
    } = await getAppointmentPaymentByAppointmentId(appointmentId);

    if (!paymentId) {
      return Response.BAD_REQUEST({
        message: "Error processing payment. Please try again",
      });
    }

    if (transactionID !== null && paymentStatus === "success") {
      console.log("Appointment already booked");
      return Response.NOT_MODIFIED();
    }

    //Delete the apppointment and appointment paymetn from the database
    await Promise.all([
      deleteAppointmentPaymentByAppointmentId({ appointmentId }),
      deleteAppointmentById({ appointmentId }),
    ]);

    //TODO Send an email to the user that the appointment was not booked
    // await paymentCanceledPatientAppointmentEmail({

    // })
    return Response.SUCCESS({
      message: "Medical Appointment Cancelled Successfully.",
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
};
