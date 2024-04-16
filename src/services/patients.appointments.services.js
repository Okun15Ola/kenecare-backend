const moment = require("moment");
const { v4: uuidv4 } = require("uuid");
const dbObject = require("../db/db.appointments.patients");
const {
  getPatientByUserId,
  updatePatientFirstAppointmentStatus,
} = require("../db/db.patients");
const {
  getDoctorAppointByDateAndTime,
} = require("../db/db.appointments.doctors");
const { getUserById } = require("../db/db.users");
const { USER_TYPE } = require("../utils/enum.utils");
const Response = require("../utils/response.utils");
const { getDoctorById } = require("../db/db.doctors");
const {
  createAppointmentPayment,
  createFirstAppointmentPayment,
} = require("../db/db.payments");

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
        specialization_id: specialtyId,
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
          appointmentType: appointmentType.split("_").join(" ").toUpperCase(),
          patientNameOnPrescription,
          patientMobileNumber,
          patientSymptoms,
          consultationFees: `SLE ${parseInt(consultationFees)}`,
          specialtyId,
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
      specialization_id: specialtyId,
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
      appointmentType: appointmentType.split("_").join(" ").toUpperCase(),
      appointmentDate: moment(appointmentDate).format("YYYY-MM-DD"),
      patientNameOnPrescription,
      patientMobileNumber,
      patientSymptoms,
      consultationFees: `SLE ${parseInt(consultationFees)}`,
      specialtyId,
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
      specialization_id: specialtyId,
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
      appointmentType: appointmentType.split("_").join(" ").toUpperCase(),
      appointmentDate: moment(appointmentDate).format("YYYY-MM-DD"),
      patientNameOnPrescription,
      patientMobileNumber,
      patientSymptoms,
      consultationFees: `SLE ${parseInt(consultationFees)}`,
      specialtyId,
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
    const [patient, doctor] = await Promise.all([
      getPatientByUserId(userId),
      getDoctorById(doctorId),
    ]);

    const {
      patient_id: patientId,
      booked_first_appointment: hasBookedFirstAppointment,
    } = patient;

    const { consultation_fee: consultationFee } = doctor;

    //DONE check if patient profile exist for the user booking appointment
    if (!patientId) {
      return Response.BAD_REQUEST({
        message:
          "User must be registered as a patient before booking an appointment",
      });
    }

    // Check if the selected doctor's timeslot is available,
    const timeBooked = await getDoctorAppointByDateAndTime({
      doctorId,
      date: appointmentDate,
      time: appointmentTime,
    });

    if (timeBooked) {
      return Response.BAD_REQUEST({
        message:
          "An appointment has already been booked for the specified time, please select a new appointment time",
      });
    }
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

    if (!hasBookedFirstAppointment) {
      await createFirstAppointmentPayment({
        appointmentId,
        amountPaid: consultationFee,
        orderId: genUUID,
        paymentMethod: "ORNAGE MONEY",
        transactionId: "FIRST_FREE_APPOINTMENT",
        paymentToken: "FIRST_FREE_APPOINTMENT",
        notificationToken: "FIRST_FREE_APPOINTMENT",
        status: "success",
      });

      await updatePatientFirstAppointmentStatus(patientId);

      return Response.CREATED({
        message:
          "First Free Medical Appointment Booked Successfully. Thank you for choosing Kenecare",
        data: {
          paymentUrl: null,
        },
      });
    }
    //Get and send payment url to process payment
    const {
      payment_url: paymentUrl,
      notif_token: notificationToken,
      pay_token: paymentToken,
    } = await getPaymentURL({
      orderId: genUUID,
      amount: consultationFee,
    });

    // create new appointment payments record
    await createAppointmentPayment({
      appointmentId,
      amountPaid: consultationFee,
      orderId: genUUID,
      paymentMethod: "ORNAGE MONEY",
      paymentToken,
      notificationToken,
    });

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
