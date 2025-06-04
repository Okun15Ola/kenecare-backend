const moment = require("moment");
const { v4: uuidv4 } = require("uuid");
const logger = require("../../middlewares/logger.middleware");
const repo = require("../../repository/patientAppointments.repository");
const {
  getPatientByUserId,
  updatePatientFirstAppointmentStatus,
} = require("../../repository/patients.repository");
const {
  getDoctorAppointByDateAndTime,
} = require("../../repository/doctorAppointments.repository");

const Response = require("../../utils/response.utils");
const { getDoctorById } = require("../../repository/doctors.repository");
const {
  createAppointmentPayment,
  createFirstAppointmentPayment,
} = require("../../repository/payments.repository");

const { getPaymentUSSD } = require("../../utils/payment.utils");
const {
  getAppointmentFollowUps,
} = require("../../repository/follow-up.repository");
const {
  doctorAppointmentBookedSms,
  appointmentBookedSms,
} = require("../../utils/sms.utils");
const redisClient = require("../../config/redis.config");

exports.getPatientAppointments = async ({ userId, page, limit }) => {
  try {
    const patient = await getPatientByUserId(userId);

    if (!patient) {
      return Response.NOT_FOUND({
        message:
          "Patient profile not found please, create profile before proceeding",
      });
    }
    const { patient_id: patientId } = patient;
    const cacheKey = `patient-appointments-${patientId}:all`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }
    const rawData = await repo.getAllPatientAppointments({
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
      }) => ({
        appointmentId,
        appointmentUUID,
        patient,
        username: `${firstName} ${lastName}`,
        gender,
        doctorId,
        doctorName: `Dr. ${doctorFirstName} ${doctorLastName}`,
        appointmentDate: moment(appointmentDate).format("YYYY-MM-DD"),
        appointmentTime,
        appointmentType: appointmentType.split("_").join(" ").toUpperCase(),
        patientNameOnPrescription,
        patientMobileNumber,
        patientSymptoms,
        consultationFees: `SLE ${parseInt(consultationFees, 10)}`,
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
      }),
    );

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(appointments),
    });

    return Response.SUCCESS({ data: appointments });
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

exports.getPatientAppointment = async ({ userId, id }) => {
  try {
    const { patient_id: patientId } = await getPatientByUserId(userId);
    const cacheKey = `patient-appointments-${patientId}:${id}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }

    const rawData = await repo.getPatientAppointmentById({
      patientId,
      appointmentId: id,
    });

    //  Check if the requesting user is the owner of the appointment
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

    const rawFollowUps = await getAppointmentFollowUps(appointmentId);
    const followUps = rawFollowUps.map(
      ({
        followup_id: followUpId,
        followup_date: followUpDate,
        followup_time: followUpTime,
        reason: followUpReason,
        followup_status: followUpStatus,
        followup_type: followUpType,
        meeting_id: meetingId,
      }) => {
        return {
          followUpId,
          followUpDate,
          followUpTime,
          followUpReason,
          followUpStatus,
          followUpType,
          meetingId,
        };
      },
    );

    const appointment = {
      appointmentId,
      appointmentUUID,
      patient,
      username: `${firstName} ${lastName}`,
      doctorId,
      doctorName: `Dr. ${doctorFirstName} ${doctorLastName}`,
      appointmentType: appointmentType.split("_").join(" ").toUpperCase(),
      appointmentDate: moment(appointmentDate).format("YYYY-MM-DD"),
      patientNameOnPrescription,
      patientMobileNumber,
      patientSymptoms,
      consultationFees: `SLE ${parseInt(consultationFees, 10)}`,
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
      followUps,
    };

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(appointment),
    });

    return Response.SUCCESS({ data: appointment });
  } catch (error) {
    logger.error(error);
    console.error(error);
    throw error;
  }
};

exports.getPatientAppointmentByUUID = async ({ userId, uuId }) => {
  try {
    const { patient_id: patientId } = await getPatientByUserId(userId);
    const cacheKey = `patient-appointments-by-uuid:${uuId}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }

    const rawData = await repo.getPatientAppointmentByUUID({
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
      doctorId,
      doctorName: `Dr. ${doctorFirstName} ${doctorLastName}`,
      appointmentType: appointmentType.split("_").join(" ").toUpperCase(),
      appointmentDate: moment(appointmentDate).format("YYYY-MM-DD"),
      patientNameOnPrescription,
      patientMobileNumber,
      patientSymptoms,
      consultationFees: `SLE ${parseInt(consultationFees, 10)}`,
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

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(appointment),
    });
    return Response.SUCCESS({ data: appointment });
  } catch (error) {
    console.error(error);
    logger.error(error);
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
}) => {
  try {
    // DONE Get patient Id from logged in user
    const [patient, doctor] = await Promise.all([
      getPatientByUserId(userId),
      getDoctorById(doctorId),
    ]);

    //  check if patient profile exist for the user booking appointment
    if (!patient) {
      return Response.BAD_REQUEST({
        message:
          "Please create a patient profile before booking an appointment",
      });
    }

    // check if the specified doctor exist
    // if (!doctor) {
    //   return Response.BAD_REQUEST({
    //     message: "Specified Doctor does not exist. Please try again",
    //   });
    // }

    const {
      patient_id: patientId,
      first_name: userFirstName,
      last_name: userLastName,
      booked_first_appointment: hasBookedFirstAppointment,
      mobile_number: mobileNumber,
    } = patient;

    const {
      consultation_fee: consultationFee,
      first_name: doctorFirstName,
      last_name: doctorLastName,
      mobile_number: doctorMobileNumber,
    } = doctor;

    // Check if the selected doctor's timeslot is available,
    const timeBooked = await getDoctorAppointByDateAndTime({
      doctorId,
      date: appointmentDate,
      time: appointmentTime,
    });

    if (timeBooked) {
      return Response.BAD_REQUEST({
        message:
          "An appointment has already been booked for the specified time. Please choose a new appointment time",
      });
    }
    // Generate a unique ID for each appointment
    const generatedOrderId = uuidv4();

    const { insertId: appointmentId } = await repo.createNewPatientAppointment({
      uuid: generatedOrderId,
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
        orderId: generatedOrderId,
        paymentMethod: "FIRST_FREE_APPOINTMENT",
        transactionId: "FIRST_FREE_APPOINTMENT",
        paymentToken: "FIRST_FREE_APPOINTMENT",
        notificationToken: "FIRST_FREE_APPOINTMENT",
        status: "success",
      });

      await updatePatientFirstAppointmentStatus(patientId);

      appointmentBookedSms({
        mobileNumber,
        patientName: `${userFirstName} ${userLastName}`,
        doctorName: `${doctorFirstName} ${doctorLastName}`,
        patientNameOnPrescription: patientName,
        appointmentDate: moment(appointmentDate).format("YYYY-MM-DD"),
        appointmentTime,
      });
      doctorAppointmentBookedSms({
        mobileNumber: doctorMobileNumber,
        doctorName: `${doctorLastName}`,
        patientNameOnPrescription: patientName,
        appointmentDate: moment(appointmentDate).format("YYYY-MM-DD"),
        appointmentTime,
      });

      return Response.CREATED({
        message:
          "First Free Medical Appointment Booked Successfully. Thank you for choosing Kenecare",
        data: {
          paymentUrl: null,
          firstAppointment: true,
        },
      });
    }
    // Get and send payment url to process payment
    const response = await getPaymentUSSD({
      orderId: generatedOrderId,
      amount: consultationFee,
    }).catch((error) => {
      throw error;
    });

    if (!response) {
      await repo.deleteAppointmentById({ appointmentId });
      return Response.INTERNAL_SERVER_ERROR({
        message: "An Error Occured on our side, please try again",
      });
    }

    const { ussdCode, paymentCodeId, idempotencyKey, expiresAt, cancelUrl } =
      response;

    // const { paymentUrl, notificationToken, paymentToken } = await getPaymentURL(
    //   {
    //     orderId: genUUID,
    //     amount: consultationFee,
    //   },
    // ).catch((error) => {
    //   throw error;
    // });

    // create new appointment payments record
    await createAppointmentPayment({
      appointmentId,
      amountPaid: consultationFee,
      orderId: generatedOrderId,
      paymentMethod: "",
      paymentToken: ussdCode,
      notificationToken: idempotencyKey,
      transactionId: paymentCodeId,
    });

    return Response.CREATED({
      message: "Appointment Booked Successfully. Proceed to payment.",
      data: {
        paymentUrl: ussdCode,
        cancelUrl,
        paymentUrlExpiresAt: expiresAt,
      },
    });
  } catch (error) {
    logger.error("Create Appointment Error", error);
    throw error;
  }
};
