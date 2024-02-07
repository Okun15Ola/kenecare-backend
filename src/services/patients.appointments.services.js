const moment = require("moment");
const dbObject = require("../db/db.appointments.patients");
const { getPatientByUserId } = require("../db/db.patients");
const { getDoctorAppointByDate } = require("../db/db.appointments.doctors");
const { getUserById } = require("../db/db.users");
const { USER_TYPE } = require("../utils/enum.utils");
const Response = require("../utils/response.utils");
const { v4: uuidv4 } = require("uuid");
const { getDoctorById } = require("../db/db.doctors");
const { createAppointmentPayment } = require("../db/db.payments");

const { getPaymentURL } = require("../utils/payment.utils");

exports.getPatientAppointments = async ({ userId, page, limit }) => {
  try {
    const { patient_id: patientId } = await getPatientByUserId(userId);

    const rawData = await dbObject.getAllPatientAppointments({
      patientId,
      page,
      limit,
    });

    const appointments = rawData.map(
      ({
        appointment_id: appointmentId,
        appointment_uuid: appointmentUUID,
        patient_id: patient,
        first_name: firstName,
        last_name: lastName,
        gender,
        doctor_id: doctorId,
        doctor_first_name: doctorFirstName,
        doctor_last_name: doctorLastName,
        appointment_type: appointmentType,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        patient_name_on_prescription: patientNameOnPrescription,
        patient_mobile_number: patientMobileNumber,
        patient_symptoms: patientSymptoms,
        consultation_fee: consultationFees,
        specialty_name: specialty,
        time_slot: timeSlot,
        meeting_id: meetingId,
        join_url: meetingJoinUrl,
        start_time: appointmentStartTime,
        end_time: appointmentEndTime,
        appointment_status: appointmentStatus,
        cancelled_reason: cancelledReason,
        cancelled_at: cancelledAt,
        cancelled_by: cancelledBy,
        postponed_reason: postponedReason,
        postponed_date: postponeDate,
        postponed_by: postponedBy,
        created_at: createdAt,
        payment_method: paymentMethod,
        payment_status: paymentStatus,
        transactionId: paymentTransactionId,
      }) => {
        return {
          appointmentId,
          appointmentUUID,
          patient,
          username: `${firstName} ${lastName}`,
          gender,
          doctorId: doctorId,
          doctorName: `Dr. ${doctorFirstName} ${doctorLastName}`,
          appointmentDate: moment(appointmentDate).format("YYYY-MM-DD"),
          appointmentTime,
          appointmentType,
          patientNameOnPrescription,
          patientMobileNumber,
          patientSymptoms,
          consultationFees: `SLE ${parseInt(consultationFees)}`,
          specialty,
          timeSlot,
          meetingId,
          meetingJoinUrl,
          appointmentStartTime,
          appointmentEndTime,
          appointmentStatus,
          paymentMethod,
          paymentStatus,
          paymentTransactionId,
          cancelledReason,
          cancelledAt,
          cancelledBy,
          postponedReason,
          postponeDate,
          postponedBy,
          createdAt: moment(createdAt).format("YYYY-MM-DD"),
        };
      }
    );

    return Response.SUCCESS({ data: appointments });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.getPatientAppointment = async ({ userId, id }) => {
  try {
    const { patient_id: patientId } = await getPatientByUserId(userId);

    const rawData = await dbObject.getPatientAppointmentById({
      patientId,
      appointmentId: id,
    });

    //TODO Check if the requesting user is the owner of the appointment
    if (!rawData) {
      return Response.NOT_FOUND({ message: "Appointment Not Found" });
    }
    const {
      appointment_id: appointmentId,
      appointment_uuid: appointmentUUID,
      patient_id: patient,
      first_name: firstName,
      last_name: lastName,
      doctor_id: doctorId,
      doctor_first_name: doctorFirstName,
      doctor_last_name: doctorLastName,
      appointment_type: appointmentType,
      appointment_date: appointmentDate,
      patient_name_on_prescription: patientNameOnPrescription,
      patient_mobile_number: patientMobileNumber,
      patient_symptoms: patientSymptoms,
      consultation_fee: consultationFees,
      specialty_name: specialty,
      time_slot: timeSlot,
      meeting_id: meetingId,
      join_url: meetingJoinUrl,
      start_time: appointmentStartTime,
      end_time: appointmentEndTime,
      appointment_status: appointmentStatus,
      cancelled_reason: cancelledReason,
      cancelled_at: cancelledAt,
      cancelled_by: cancelledBy,
      postponed_reason: postponedReason,
      postponed_date: postponeDate,
      postponed_by: postponedBy,
      created_at: createdAt,
      payment_method: paymentMethod,
      payment_status: paymentStatus,
      transactionId: paymentTransactionId,
    } = rawData;

    const appointment = {
      appointmentId,
      appointmentUUID,
      patient,
      username: `${firstName} ${lastName}`,
      doctorId: doctorId,
      doctorName: `Dr. ${doctorFirstName} ${doctorLastName}`,
      appointmentType,
      appointmentDate: moment(appointmentDate).format("YYYY-MM-DD"),
      patientNameOnPrescription,
      patientMobileNumber,
      patientSymptoms,
      consultationFees: `SLE ${parseInt(consultationFees)}`,
      specialty,
      timeSlot,
      meetingId,
      meetingJoinUrl,
      appointmentStartTime,
      appointmentEndTime,
      appointmentStatus,
      paymentMethod,
      paymentStatus,
      paymentTransactionId,
      cancelledReason,
      cancelledAt,
      cancelledBy,
      postponedReason,
      postponeDate,
      postponedBy,
      createdAt: moment(createdAt).format("YYYY-MM-DD"),
    };

    return Response.SUCCESS({ data: appointment });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.getPatientAppointmentByUUID = async ({ userId, uuId }) => {
  try {
    const { patient_id: patientId } = await getPatientByUserId(userId);

    const rawData = await dbObject.getPatientAppointmentByUUID({
      patientId,
      uuId,
    });

    if (!rawData) {
      return Response.NOT_FOUND({ message: "Appointment Not Found" });
    }

    const {
      appointment_id: appointmentId,
      appointment_uuid: appointmentUUID,
      patient_id: patient,
      first_name: firstName,
      last_name: lastName,
      doctor_id: doctorId,
      doctor_first_name: doctorFirstName,
      doctor_last_name: doctorLastName,
      appointment_type: appointmentType,
      appointment_date: appointmentDate,
      patient_name_on_prescription: patientNameOnPrescription,
      patient_mobile_number: patientMobileNumber,
      patient_symptoms: patientSymptoms,
      consultation_fee: consultationFees,
      specialty_name: specialty,
      time_slot: timeSlot,
      meeting_id: meetingId,
      join_url: meetingJoinUrl,
      start_time: appointmentStartTime,
      end_time: appointmentEndTime,
      appointment_status: appointmentStatus,
      cancelled_reason: cancelledReason,
      cancelled_at: cancelledAt,
      cancelled_by: cancelledBy,
      postponed_reason: postponedReason,
      postponed_date: postponeDate,
      postponed_by: postponedBy,
      created_at: createdAt,
      payment_method: paymentMethod,
      payment_status: paymentStatus,
      transactionId: paymentTransactionId,
    } = rawData;

    const appointment = {
      appointmentId,
      appointmentUUID,
      patient,
      username: `${firstName} ${lastName}`,
      doctorId: doctorId,
      doctorName: `Dr. ${doctorFirstName} ${doctorLastName}`,
      appointmentType,
      appointmentDate: moment(appointmentDate).format("YYYY-MM-DD"),
      patientNameOnPrescription,
      patientMobileNumber,
      patientSymptoms,
      consultationFees: `SLE ${parseInt(consultationFees)}`,
      specialty,
      timeSlot,
      meetingId,
      meetingJoinUrl,
      appointmentStartTime,
      appointmentEndTime,
      appointmentStatus,
      paymentMethod,
      paymentStatus,
      paymentTransactionId,
      cancelledReason,
      cancelledAt,
      cancelledBy,
      postponedReason,
      postponeDate,
      postponedBy,
      createdAt: moment(createdAt).format("YYYY-MM-DD"),
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

    const { insertId: appointmentId } =
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
      notif_token: notificationToken,
      pay_token: paymentToken,
    } = await getPaymentURL({
      orderId: genUUID,
      amount: consultationFee,
    });

    //TODO create new appointment payments record
    const done = await createAppointmentPayment({
      appointmentId,
      amountPaid: consultationFee,
      orderId: genUUID,
      paymentMethod: "ORNAGE MONEY",
      paymentToken,
      notificationToken,
    });

    console.log(done);

    return Response.CREATED({
      message: "Appointment Booked Successfully. Proceed to payment.",
      data: {
        paymentUrl,
      },
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
