"use strict";
const sendGrid = require("@sendgrid/mail");
const {
  sendGridApiKey,
  sendGridSenderEmail,
} = require("../config/default.config");
const { kenecareAdminEmail } = require("../config/default.config");
sendGrid.setApiKey(sendGridApiKey);

const mailer = {
  from: {
    name: "KENECARE (SL)",
    email: sendGridSenderEmail,
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
    await sendGrid.send(message).catch((err) => {
      throw err;
    });
  } catch (error) {
    console.error(error);
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
    await sendGrid.send(message).catch((err) => {
      throw err;
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const adminDoctorCouncilRegistrationEmail = async ({ doctorName }) => {
  try {
    const message = {
      to: kenecareAdminEmail,
      from: mailer.from,
      subject: "Request for Approval: Medical Council Document Submission",
      text: "Kenecare Admin Notification",
      html: `<h3>Dear KENECARE ADMIN</h3>
    <p>This is a notification email to bring to your attention that Dr. ${doctorName} submitted their Medical Council Registration Document on Kenecare that requires your approval</p> 
   
    <p>The approval process is expected to take 48 hours or less. Once approved, the doctor will be eligible to receive appointments from users seeking healthcare services.</p>
    `,
    };
    const result = await sendGrid.send(message).catch((err) => {
      throw err;
    });
    console.log(result);
  } catch (error) {
    console.error(error);
    throw error;
  }
};
const adminDoctorProfileRegistrationEmail = async ({ doctorName }) => {
  try {
    const message = {
      to: kenecareAdminEmail,
      from: mailer.from,
      subject: "Request for Approval: Doctor Profile",
      text: "Kenecare Admin Notification",
      html: `<h3>Dear KENECARE ADMIN</h3>
    <p>This is a notification email to bring to your attention that Dr. ${doctorName} has just created their doctor's profile on KENECARE that requires your approval. Please login to your admin dashboard and process their approval so that they can start using the KENECARE platform.</p> 
   
    <p>The approval process is expected to take 48 hours or less. Once approved, the doctor will be eligible to receive appointments from users seeking healthcare services.</p>
    `,
    };
    await sendGrid.send(message).catch((err) => {
      throw err;
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const doctorCouncilRegistrationEmail = async ({ doctorEmail, doctorName }) => {
  try {
    const message = {
      to: doctorEmail,
      from: mailer.from,
      subject:
        "Approval Process for Your Medical Council Registration Document on Kenecare.",
      html: `<h1>Dear Dr. ${doctorName}. </h1>
    <p>
    Thank you for submitting your Medical Council Document information for approval on the Kenecare platform. We appreciate your commitment to providing quality healthcare services to our community. We understand the importance of a swift approval process, and we're pleased to inform you that our team is dedicated to reviewing your submission promptly. The approval process typically takes 8 hours or less.
    </p>
    <p>Once your document has gone through the approval process, you will receive an email notification confirming the status of your profile. If your document meets our requirements, you will be able to start receiving appointments on the Kenecare platform.</p>
    <p> We appreciate your patience and cooperation during this process. If you have any questions or concerns, please feel free to reach out to our support team at [support@email.com]. We are here to assist you in any way we can.
    Thank you for being a valued member of the Kenecare community. We look forward to having you on board and contributing to the well-being of our users.</p>
    
    <footer>
      <p>Kenecare Support Team</p>
      <p>support@kenecare.com</p>
      <p><a href="https://kenecare.com">Kenecare.com</a></p>
    </footer>
    
    `,
    };
    const result = await sendGrid.send(message).catch((err) => {
      throw err;
    });

    console.log(result);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const doctorCouncilRegistrationApprovedEmail = async ({
  doctorEmail,
  doctorName,
}) => {
  try {
    const message = {
      to: doctorEmail,
      from: mailer.from,
      subject: "Medical Council Registration Approved",
      html: `<h1>Dear Dr. ${doctorName}. </h1>
    <p>
    Thank you for submitting your Medical Council Document information for approval on the Kenecare platform. Your council registration document has been approved successfully, you can now start receiving appointments from patient s on Kenecare. 
    </p>
    <p> We appreciate your patience and cooperation during this process. If you have any questions or concerns, please feel free to reach out to our support team at [support@email.com]. We are here to assist you in any way we can.
    Thank you for being a valued member of the Kenecare community. We look forward to having you on board and contributing to the well-being of our users.</p>
    
    <footer>
      <p>Kenecare Support Team</p>
      <p>support@kenecare.com</p>
      <p><a href="https://kenecare.com">Kenecare.com</a></p>
    </footer>
    
    `,
    };
    const result = await sendGrid.send(message).catch((err) => {
      throw err;
    });

    console.log(result);
  } catch (error) {
    console.error(error);
    throw error;
  }
};
const doctorCouncilRegistrationRejectedEmail = async ({
  doctorEmail,
  doctorName,
  rejectionReason,
}) => {
  try {
    const message = {
      to: doctorEmail,
      from: mailer.from,
      subject: "Medical Council Registration Reject",
      html: `<h1>Dear Dr. ${doctorName}. </h1>
    <p>
    Thank you for submitting your Medical Council Document information for approval on the Kenecare platform. Your council registration document was rejected by Kenecare Admin.
    </p>
    <p>
    Reason for Rejection: ${rejectionReason}
    </p>
    <p> We appreciate your patience and cooperation during this process. If you have any questions or concerns, please feel free to reach out to our support team at [support@email.com]. We are here to assist you in any way we can.
    Thank you for being a valued member of the Kenecare community. We look forward to having you on board and contributing to the well-being of our users.</p>
    
    <footer>
      <p>Kenecare Support Team</p>
      <p>support@kenecare.com</p>
      <p><a href="https://kenecare.com">Kenecare.com</a></p>
    </footer>
    
    `,
    };
    const result = await sendGrid.send(message).catch((err) => {
      throw err;
    });

    console.log(result);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const patientAppointmentApprovalEmail = async ({
  patientEmail,
  patientNameOnPrescription,
  symptoms,
  appointmentDate,
  appointmentTime,
  patientName,
  doctorName,
  meetingJoinLink,
}) => {
  try {
    const message = {
      to: patientEmail,
      from: mailer.from,
      subject: `Kenecare Medical Appointment with Dr. ${doctorName} Approved`,
      html: `<h1>Dear ${patientName}. </h1>
    <p>We are please to inform you that your Kenecare Medical Appointment with Dr. ${doctorName} has been approved. The details of your appointment are as follows: </p>
    <ul>
      <li>Patient's Name: ${patientNameOnPrescription.toUpperCase()}</li>
      <li>Symptoms: <strong>${symptoms}</strong></li>
      <li>Date: ${appointmentDate}</li>
      <li>Time: ${appointmentTime}</li>
    </ul>
    <p>To Join the virtual meeting please <a href="${meetingJoinLink}">CLICK HERE</a> or copy and paste this link in your browser: ${meetingJoinLink}</p>

    <p>Please ensure that you have a stable internet connection and a device with a camera and microphone for the virtual consultation.</p>

    <p>An SMS notification would be sent 30 minutes before the scheduled start time as a reminder. If you encounter any issues or have any questions, feel free to to send us an email to support@kenecare or call this TOLL FREE line 4545. </p>
    
    <footer>
      <p>Kenecare Support Team</p>
      <p>support@kenecare.com</p>
      <p><a href="https://kenecare.com">Kenecare.com</a></p>
    </footer>
    
    `,
    };
    await sendGrid.send(message).catch((error) => {
      throw error;
    });
  } catch (error) {
    console.error(error);
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
    await sendGrid.send(message).catch((err) => {
      throw err;
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

module.exports = {
  newPatientAppointmentEmail,
  newDoctorAppointmentEmail,
  paymentCanceledPatientAppointmentEmail,
  doctorCouncilRegistrationEmail,
  adminDoctorCouncilRegistrationEmail,
  adminDoctorProfileRegistrationEmail,
  patientAppointmentApprovalEmail,
  doctorCouncilRegistrationApprovedEmail,
  doctorCouncilRegistrationRejectedEmail,
};
