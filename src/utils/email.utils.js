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
}) => {
  try {
    let message = {
      to: patientEmail,
      from: mailer.from,
      subject: "Confirmation of Your Upcoming Appointment",
      text: "Test Email",
      html: `<h1>Dear ${patientName}</h1> <br /> 
    <p>This is a confirmation email for your recently booked appointment with Dr. <strong>${doctorName}</strong> on Kenecare. We are excited to assist you with your health care needs and look forward to providing you with exceptional care.</p> <br />
    <h4>Appointment Details:</h4>
    <ul>
      <li>Date: ${appointmentDate} </li>
      <li>Time: ${appointmentTime} </li>
      <li>Doctor: ${doctorName}</li>
    </ul> <br />
    <p>If you need to reschedule or have any questions regarding your appointment, please feel free to contact our office at [Contact Number] or reply to this email. We kindly ask that you arrive at least 15 minutes before your scheduled appointment time to complete any necessary paperwork.</p> <br />
    <p>Thank you for choosing Kenecare for your healthcare needs. We value your trust in us and are committed to making your experience as comfortable and efficient as possible.</p>`,
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
}) => {
  try {
    const message = {
      to: doctorEmail,
      from: mailer.from,
      subject: "Notification of Newly Booked Patient Appointment",
      text: "Test Email",
      html: `<h1>Dear Dr. ${doctorName}</h1> <br /> 
    <p>This is a notification email for a newly booked patient appointment in your schedule.</p> <br />
    <h4>Appointment Details:</h4>
    <ul>
      <li>Date: ${appointmentDate} </li>
      <li>Time: ${appointmentTime} </li>
      <li>Doctor: ${doctorName}</li>
      <li>Symptoms: ${symptoms}</li>
    </ul> <br />
    <p>If, for any reason, you are unable to attend to this appointment, or if there are any changes, please notify the patient at your earliest convenience.</p> <br />
    <p>Thank you for your dedication to providing excellent patient care.</p>`,
    };
    const result = await sendGrid.send(message).catch((err) => {
      throw err;
    });
    console.log(result);
  } catch (error) {
    throw error;
  }
};

module.exports = {
  newPatientAppointmentEmail,
  newDoctorAppointmentEmail,
};
