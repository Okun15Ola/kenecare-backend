const dbObject = require("../db/db.appointments.patients");
const { getPatientByUserId } = require("../db/db.patients");
const { getDoctorAppointByDate } = require("../db/db.appointments.doctors");
const { getUserById } = require("../db/db.users");
const { USER_TYPE } = require("../utils/enum.utils");
const Response = require("../utils/response.utils");
const { v4: uuidv4 } = require("uuid");
const { getDoctorById } = require("../db/db.doctors");

const {
  newPatientAppointmentEmail,
  newDoctorAppointmentEmail,
} = require("../utils/email.utils");
const { getPaymentURL } = require("../utils/payment.utils");

exports.getPatientAppointments = async (userId) => {
  try {
    const { patient_id: patientId } = await getPatientByUserId(userId);

    const rawData = await dbObject.getAllPatientAppointments(patientId);

    const appointments = rawData.map(
      ({
        appointment_id: appointmentId,
        appointment_uuid: appointmentUUID,
        patient_id: patient,
        doctor_id: doctor,
        appointment_type: appointmentType,
        patient_name_on_prescription: patientNameOnPrescription,
        patient_mobile_number: patientMobileNumber,
        patient_symptoms: patientSymptoms,
        consultation_fee_paid: consultationFees,
        specialty,
        time_slot: timeSlot,
        start_time: appointmentStartTime,
        end_time: appointmentEndTime,
        appointment_status: appointmentStatus,
        cancelled_reason: cancelledReason,
        cancelled_at: cancelledAt,
        cancelled_by: cancelledBy,
        postponed_reason: postponedReason,
        postponed_date: postponeDate,
        postponed_by: postponedBy,
        created_at: createAt,
      }) => {
        return {
          appointmentId,
          appointmentUUID,
          patient,
          doctor,
          appointmentType,
          patientNameOnPrescription,
          patientMobileNumber,
          patientSymptoms,
          consultationFees,
          specialty,
          timeSlot,
          appointmentStartTime,
          appointmentEndTime,
          appointmentStatus,
          cancelledReason,
          cancelledAt,
          cancelledBy,
          postponedReason,
          postponeDate,
          postponedBy,
          createAt,
        };
      }
    );

    return Response.SUCCESS({ data: appointments });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.getPatientAppointment = async (userId, appointmentId) => {
  try {
    const { patient_id: patientId } = await getPatientByUserId(userId);

    const rawData = await dbObject.getPatientAppointmentById({
      patientId,
      appointmentId,
    });

    //TODO Check if the requesting user is the owner of the appointment
    if (!rawData) {
      return Response.NOT_FOUND({ message: "Appointment Not Found" });
    }
    const {
      appointment_id: appointmentId,
      appointment_uuid: appointmentUUID,
      patient_id: patient,
      doctor_id: doctor,
      appointment_type: appointmentType,
      patient_name_on_prescription: patientNameOnPrescription,
      patient_mobile_number: patientMobileNumber,
      patient_symptoms: patientSymptoms,
      consultation_fee_paid: consultationFees,
      specialty,
      time_slot: timeSlot,
      start_time: appointmentStartTime,
      end_time: appointmentEndTime,
      appointment_status: appointmentStatus,
      cancelled_reason: cancelledReason,
      cancelled_at: cancelledAt,
      cancelled_by: cancelledBy,
      postponed_reason: postponedReason,
      postponed_date: postponeDate,
      postponed_by: postponedBy,
      created_at: createAt,
    } = rawData;

    const appointment = {
      appointmentId,
      appointmentUUID,
      patient,
      doctor,
      appointmentType,
      patientNameOnPrescription,
      patientMobileNumber,
      patientSymptoms,
      consultationFees,
      specialty,
      timeSlot,
      appointmentStartTime,
      appointmentEndTime,
      appointmentStatus,
      cancelledReason,
      cancelledAt,
      cancelledBy,
      postponedReason,
      postponeDate,
      postponedBy,
      createAt,
    };

    return Response.SUCCESS({ data: appointment });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
exports.createPatientAppointment = async ({
  userId,
  doctorId,
  patientName,
  patientNumber,
  appointmentType,
  appointmentDate,
  appointmentTime,
  symptoms,
  specialtyId,
  timeSlotId,
}) => {
  try {
    //DONE Get patient Id from logged in user

    const [patient, user, doctor, doctorAppoinments] = await Promise.all([
      getPatientByUserId(userId),
      getUserById(userId),
      getDoctorById(doctorId),
      getDoctorAppointByDate({ doctorId, appointmentDate }),
    ]);

    const { patient_id: patientId } = patient;
    const { email: patientEmail } = user;
    const {
      email: doctorEmail,
      first_name: doctorFirstName,
      last_name: doctorLastName,
      consultation_fee: consultationFee,
    } = doctor;

    //DONE check if patient profile exist for the user booking appointment
    if (!patientId) {
      return Response.BAD_REQUEST({
        message:
          "User must be registered as a patient before booking an appointment",
      });
    }

    //DONE Check if the number of appointment for the selected doctor and selected date is more than 10

    // if (doctorsAppointmentForDate.length >= 10) {
    //   return Response.BAD_REQUEST({
    //     message:
    //       "Maximum appointment for doctor reached for the selected date. Please choose an earlier date",
    //   });
    // }

    //TODO Check if the selected doctor's timeslot is available,

    //Generate a unique ID for each appointment
    const genUUID = uuidv4();

    await dbObject.createNewPatientAppointment({
      uuid: genUUID,
      patientId,
      doctorId,
      patientName,
      patientNumber,
      symptoms,
      appointmentType,
      consultationFee,
      specialtyId,
      appointmentDate,
      appointmentTime,
    });

    //DONE Send email notification to doctor and patient
    // if (patientEmail) {
    //   await Promise.allSettled([
    //     newPatientAppointmentEmail({
    //       patientName: patientName.toUpperCase(),
    //       patientEmail,
    //       appointmentDate,
    //       appointmentTime,
    //       doctorName: `${doctorFirstName} ${doctorLastName}`,
    //     }),
    //     newDoctorAppointmentEmail({
    //       doctorEmail,
    //       doctorName: `${doctorFirstName} ${doctorLastName}`,
    //       appointmentDate,
    //       appointmentTime,
    //       symptoms,
    //     }),
    //   ]);
    // } else {
    //   //send email to doctor
    //   await newDoctorAppointmentEmail({
    //     doctorEmail,
    //     doctorName: `${doctorFirstName} ${doctorLastName}`,
    //     appointmentDate,
    //     appointmentTime,
    //     symptoms,
    //   });
    // }

    //TODO Get and send payment url to process payment

    const {
      payment_url: paymentUrl,
      notif_token: notificatioToken,
      pay_token: paymentToken,
    } = await getPaymentURL({
      orderId: genUUID,
      amount: consultationFee,
    });



    return Response.CREATED({
      message:
        "Appointment Created Successfully. A confirmation email has been sent.",
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
exports.updateBlog = async ({ id, blog }) => {
  try {
    const result = await isBlogExist(id);

    if (!result) {
      return Response.NOT_FOUND({ message: "Blog Not Found" });
    }
    await dbObject.updateBlogById({ id, blog });
    return Response.SUCCESS({ message: "Blog Updated Succcessfully" });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
exports.updateBlogStatus = async ({ id, status }) => {
  try {
    const result = await isBlogExist(id);
    if (!result) {
      return Response.NOT_FOUND({ message: "Blog Not Found" });
    }
    await dbObject.updateBlogStatusById({ id, status });
    return Response.SUCCESS({ message: "Blog Status Updated Successfully" });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
exports.updateBlogFeaturedStatus = async ({ id, status }) => {
  try {
    const result = await isBlogExist(id);
    if (!result) {
      return Response.NOT_FOUND({ message: "Blog Not Found" });
    }
    await dbObject.updateBlogFeaturedById({ id, status });
    return Response.SUCCESS({
      message: "Blog Featured Status Updated Successfully",
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
exports.deleteBlog = async (id) => {
  try {
    const result = await isBlogExist(id);
    if (!result) {
      return Response.NOT_FOUND({ message: "Blog Not Found" });
    }
    await dbObject.deleteBlogById(id);
    return Response.SUCCESS({ message: "Blog Deleted Successfully" });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const isBlogExist = async (id) => {
  const rawData = await dbObject.getBlogById(id);
  return !!rawData;
};
