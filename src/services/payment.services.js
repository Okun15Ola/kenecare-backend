const moment = require("moment");
const {
  getPatientAppointmentByUUID,
  deleteAppointmentById,
  getAppointmentByUUID,
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
const { getPatientByUserId, getPatientById } = require("../db/db.patients");
const { getDoctorById } = require("../db/db.doctors");
const { appointmentBookedSms } = require("../utils/sms.utils");

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
      patient_mobile_number: patientMobileNumber,
      patient_symptoms: symptoms,
      speciality_name: specialty,
      appointment_date: appointmentDate,
      appointment_time: appointmentTime,
    } = appointment;

    const appointmentPaymentRecord = await getAppointmentPaymentByAppointmentId(
      appointmentId
    );

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
      console.log("Modiefied already");
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

    const [sts, doctor, patient] = await Promise.allSettled([
      updateAppointmentPaymentStatus({
        paymentId,
        paymentStatus: status.toLowerCase(),
        transactionId,
      }),
      getDoctorById(doctorId),
      getPatientById(patientId),
    ]);

    const { email: patientEmail, mobile_number: mobileNumber } = patient.value;
    const {
      first_name: doctorFirstName,
      last_name: doctorLastName,
      email: doctorEmail,
    } = doctor.value;

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
      //SEND  EMAIL TO DOCTOR
      await newDoctorAppointmentEmail({
        doctorEmail,
        doctorName: `${doctorFirstName} ${doctorLastName}`,
        appointmentDate,
        appointmentTime,
        patientNameOnPrescription,
        patientMobileNumber,
        symptoms,
      });

      // SEND SMS TO PATIENT
      await appointmentBookedSms({
        mobileNumber,
        patientName: `${userFirstName} ${userLastName}`,
        doctorName: `${doctorFirstName} ${doctorLastName}`,
        patientNameOnPrescription,
        appointmentDate: moment(appointmentDate).format("YYYY-MM-DD"),
        appointmentTime,
      });
    }

    return Response.CREATED({
      message:
        "Appointment Created Successfully. A confirmation has been sent.",
    });
  } catch (error) {
    console.log(error.message);
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
