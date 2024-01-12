"use strict";
const sendGrid = require("@sendgrid/mail");
const {
  sendGridApiKey,
  sendGridSenderEmail,
} = require("../config/default.config");

sendGrid.setApiKey(
  "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"
);

const mailer = {
  from: {
    name: "KENECARE (SL)",
    email: "chinedum.eke@imo-tech.com",
  },
};

const newPatientAppointmentEmail = async ({
  patientEmail,
  patientName,
  doctorName,
  appointmentDate,
  appointmentTime,
  patientNameOnPrescription,
}) => {
  try {
    let message = {
      to: patientEmail,
      from: mailer.from,
      subject: "Confirmation of Your Upcoming Appointment",
      text: "Booked Appointment Confirmation",
      html: `<h1>Dear ${patientName}</h1>
    <p>This is a confirmation email for your recently booked appointment with Dr. <strong>${doctorName}</strong> on Kenecare. We are excited to assist you with your health care needs and look forward to providing you with exceptional care.</p> <br />
    <h4>Appointment Details:</h4>
    <ul>
      <li>Date: ${appointmentDate} </li>
      <li>Time: ${appointmentTime} </li>
      <li>Doctor: Dr. ${doctorName}</li>
      <li>Name on Prescription: ${patientNameOnPrescription.toUpperCase()}</li>
    </ul> 
    <p>If you need to reschedule or have any questions regarding your appointment, please feel free to contact our office at 88 Pademba Road or send an email to support@kenecare.com. We kindly ask that you login at least 15 minutes before your scheduled appointment </p> 
    <p>Thank you for choosing Kenecare (SL) for your healthcare needs. We value your trust in us and are committed to making your experience as comfortable and efficient as possible.</p>`,
    };
    const result = await sendGrid.send(message).catch((err) => {
      throw err;
    });
    console.log(result);
  } catch (error) {
    throw error;
  }
};
const newDoctorAppointmentEmail = async ({
  doctorEmail,
  doctorName,
  appointmentDate,
  appointmentTime,
  symptoms,
  patientNameOnPrescription,
  patientMobileNumber,
}) => {
  try {
    const message = {
      to: doctorEmail,
      from: mailer.from,
      subject: "New Patient Appointment on Kenecare",
      text: "Kenecare Booked Appointment Notification",
      html: `<h1>Dear Dr. ${doctorName}. </h1>
    <p>This is a notification email for a newly booked patient appointment in your schedule.</p> 
    <h4>Appointment Details:</h4>
    <ul>
      <li>Date: ${appointmentDate} </li>
      <li>Time: ${appointmentTime} </li>
      <li>Patient's Name: ${patientNameOnPrescription.toUpperCase()}</li>
      <li>Patient's Contact: ${patientMobileNumber}</li>
      <li>Patient's Symptoms: <strong style="color:red;">${symptoms}</strong> </li>
    </ul> 
    <p>If, for any reason, you are unable to attend to this appointment, or if there are any changes, please <a href="https://doctor.kenecare.com/login">click here to login to your dashboard</a> and notify the patient at your earliest convenience.</p>
    <p>Thank you for your dedication to providing excellent patient care on Kenecare (SL).</p>`,
    };
    const result = await sendGrid.send(message).catch((err) => {
      throw err;
    });
  } catch (error) {
    throw error;
  }
};

const paymentCanceledPatientAppointmentEmail = async ({
  patientEmail,
  patientName,
}) => {
  try {
    let message = {
      to: patientEmail,
      from: mailer.from,
      subject: "Appointment Booking Failed",
      text: "",
      html: `<h1>Dear ${patientName}</h1> <br /> 
    <p>Your appointment has been canceled due to an unsuccessful payment transaction.</p> <br />
    <br />
    <p>Thank you for choosing Kenecare for your healthcare needs. We value your trust in us and are committed to making your experience as comfortable and efficient as possible.</p>`,
    };
    const result = await sendGrid.send(message).catch((err) => {
      throw err;
    });
  } catch (error) {
    throw error;
  }
};

module.exports = {
  newPatientAppointmentEmail,
  newDoctorAppointmentEmail,
  paymentCanceledPatientAppointmentEmail,
};
