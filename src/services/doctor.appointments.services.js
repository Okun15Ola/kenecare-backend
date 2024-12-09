const moment = require("moment");
const dbObject = require("../db/db.appointments.doctors");
const { getDoctorByUserId } = require("../db/db.doctors");
const { getUserById } = require("../db/db.users");
const { USERTYPE, VERIFICATIONSTATUS } = require("../utils/enum.utils");
const Response = require("../utils/response.utils");
const { getPatientById } = require("../db/db.patients");
const { createZoomMeeting } = require("../utils/zoom.utils");
const {
  appointmentApprovalSms,
  appointmentPostponedSms,
  appointmentStartedSms,
  appointmentEndedSms,
} = require("../utils/sms.utils");
const logger = require("../middlewares/logger.middleware");
const { getAppointmentFollowUps } = require("../db/db.follow-up");

exports.getDoctorAppointments = async ({ userId, page, limit }) => {
  try {
    const doctor = await getDoctorByUserId(userId);

    if (!doctor) {
      return Response.NOT_FOUND({
        message:
          "Doctor Profile Not Found. Please Register As a Doctor and Create a Doctor's Profile",
      });
    }

    const { doctor_id: doctorId, title } = doctor;

    // Get doctor's appointments
    const rawData = await dbObject.getAppointmentsByDoctorId({
      doctorId,
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
        start_url: meetingStartUrl,
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
        doctorId,
        doctorName: `${title} ${doctorFirstName} ${doctorLastName}`,
        appointmentDate,
        appointmentTime,
        appointmentType,
        patientNameOnPrescription,
        patientMobileNumber,
        patientSymptoms,
        consultationFees: `SLE ${parseInt(consultationFees, 10)}`,
        specialty,
        timeSlot,
        meetingId,
        meetingJoinUrl,
        meetingStartUrl,
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

    return Response.SUCCESS({ data: appointments });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.getDoctorAppointment = async ({ userId, id }) => {
  try {
    const doctor = await getDoctorByUserId(userId);
    if (!doctor) {
      return Response.NOT_FOUND({
        message:
          "Doctor Profile Not Found. Please Register As a Doctor and Create a Doctor's Profile",
      });
    }

    const { user_type: userType, doctor_id: doctorId, title } = doctor;

    if (userType !== USERTYPE.DOCTOR) {
      return Response.UNAUTHORIZED({ message: "Unauthorized access" });
    }

    const rawData = await dbObject.getDoctorAppointmentById({
      appointmentId: id,
      doctorId,
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
      start_url: meetingStartUrl,
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
      doctorName: `${title} ${doctorFirstName} ${doctorLastName}`,
      appointmentDate,
      appointmentTime,
      appointmentType,
      patientNameOnPrescription,
      patientMobileNumber,
      patientSymptoms,
      consultationFees: `SLE ${parseInt(consultationFees, 10)}`,
      specialty,
      timeSlot,
      meetingId,
      meetingJoinUrl,
      meetingStartUrl,
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

    return Response.SUCCESS({ data: appointment });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.getDoctorAppointmentByDateRange = async ({
  userId,
  startDate,
  endDate,
  page,
  limit,
}) => {
  try {
    const doctor = await getDoctorByUserId(userId);

    if (!doctor) {
      return Response.NOT_FOUND({
        message: "Unauthorized Action",
      });
    }

    const { doctor_id: doctorId, title } = doctor;

    const rawData = await dbObject.getDoctorAppointByDate({
      doctorId,
      startDate,
      endDate,
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
        start_url: meetingStartUrl,
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
        doctorId,
        doctorName: `${title} ${doctorFirstName} ${doctorLastName}`,
        appointmentDate,
        appointmentTime,
        appointmentType,
        patientNameOnPrescription,
        patientMobileNumber,
        patientSymptoms,
        consultationFees: `SLE ${parseInt(consultationFees, 10)}`,
        specialty,
        timeSlot,
        meetingId,
        meetingJoinUrl,
        meetingStartUrl,
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

    return Response.SUCCESS({ data: appointments });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.approveDoctorAppointment = async ({ userId, appointmentId }) => {
  try {
    const doctor = await getDoctorByUserId(userId);

    const {
      doctor_id: doctorId,
      first_name: doctorFirstName,
      last_name: doctorLastName,
    } = doctor;

    const appointment = await dbObject.getDoctorAppointmentById({
      doctorId,
      appointmentId,
    });

    // Extract patient id from appointment to get patient email
    const {
      patient_id: patientId,
      first_name: firstName,
      last_name: lastName,
      patient_name_on_prescription: patientNameOnPrescription,
      appointment_date: appointmentDate,
      appointment_time: appointmentTime,
      appointment_status: appointmentStatus,
    } = appointment;

    if (appointmentStatus === "approved" || appointmentStatus === "started") {
      return Response.NOT_MODIFIED();
    }

    const [, patient] = await Promise.allSettled([
      dbObject.approveDoctorAppointmentById({
        appointmentId,
        doctorId,
      }),
      getPatientById(patientId),
    ]);

    const { mobile_number: mobileNumber } = patient.value;

    await appointmentApprovalSms({
      doctorName: `${doctorFirstName} ${doctorLastName}`,
      patientName: `${firstName} ${lastName}`,
      patientNameOnPrescription,
      mobileNumber,
      appointmentDate: moment(appointmentDate).format("YYYY-MM-DD"),
      appointmentTime,
    });

    return Response.SUCCESS({
      message: "Medical Appointment Approved Successfully",
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
};

exports.startDoctorAppointment = async ({ userId, appointmentId }) => {
  try {
    const doctor = await getDoctorByUserId(userId);

    const {
      doctor_id: doctorId,
      first_name: doctorFirstName,
      last_name: doctorLastName,
    } = doctor;
    // Get doctor's appointment by ID
    const appointment = await dbObject.getDoctorAppointmentById({
      doctorId,
      appointmentId,
    });

    // Extract patient id from appointment to get patient email
    const {
      patient_id: patientId,
      first_name: firstName,
      last_name: lastName,
      patient_name_on_prescription: patientNameOnPrescription,
      appointment_date: appointmentDate,
      appointment_time: appointmentTime,
      appointment_status: appointmentStatus,
    } = appointment;

    if (appointmentStatus === "started") {
      return Response.NOT_MODIFIED();
    }

    const {
      zoomMeetingID,
      zoomMeetingUUID,
      zoomMeetingTopic,
      zoomMeetingJoinURL,
      zoomMeetingStartURL,
      zoomMeetingEncPassword,
    } = await createZoomMeeting({
      patientName: patientNameOnPrescription,
      appointmentDate,
      appointmentStartTime: appointmentTime,
      doctorName: `${doctorFirstName} ${doctorLastName}`,
    });
    const { insertId } = await dbObject.createNewZoomMeeting({
      meetingId: zoomMeetingID.toString(),
      meetingUUID: zoomMeetingUUID,
      meetingTopic: zoomMeetingTopic,
      joinUrl: zoomMeetingJoinURL,
      startUrl: zoomMeetingStartURL,
      encryptedPassword: zoomMeetingEncPassword,
    });

    const [patient] = await Promise.allSettled([
      getPatientById(patientId),
      dbObject.updateDoctorAppointmentMeetingId({
        doctorId,
        appointmentId,
        meetingId: insertId,
      }),
      dbObject.updateDoctorAppointmentStartTime({
        appointmentId,
        startTime: moment().format("HH:mm:ss"),
      }),
    ]);

    //  Send a notification(sms) to the user
    const { mobile_number: mobileNumber } = patient.value;
    await appointmentStartedSms({
      doctorName: `${doctorFirstName} ${doctorLastName}`,
      patientName: `${firstName} ${lastName}`,
      mobileNumber,
      meetingJoinUrl: zoomMeetingJoinURL,
    });

    return Response.SUCCESS({
      message: "Appointment Started Successfully",
      data: {
        meetingStartUrl: zoomMeetingStartURL,
        meetingJoinUrl: zoomMeetingJoinURL,
      },
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
};

exports.endDoctorAppointment = async ({ userId, appointmentId }) => {
  try {
    const doctor = await getDoctorByUserId(userId);
    if (!doctor) {
      return Response.UNAUTHORIZED({
        message: "Action can only be performed by a doctor",
      });
    }
    const {
      doctor_id: doctorId,
      first_name: doctorFirstName,
      last_name: doctorLastName,
    } = doctor;
    // Get doctor's appointment by ID
    const appointment = await dbObject.getDoctorAppointmentById({
      doctorId,
      appointmentId,
    });

    // Check if the appointment exists
    if (!appointment) {
      return Response.NOT_FOUND({
        message: "Appointment Not Found! Please Try Again!",
      });
    }

    // Extract patient id from appointment to get patient email
    const {
      patient_id: patientId,
      first_name: firstName,
      last_name: lastName,
      appointment_status: appointmentStatus,
    } = appointment;

    if (appointmentStatus === "completed") {
      return Response.NOT_MODIFIED();
    }

    const [patient] = await Promise.allSettled([
      getPatientById(patientId),
      dbObject.updateDoctorAppointmentEndTime({
        appointmentId,
        endTime: moment().format("HH:mm:ss"),
      }),
    ]);

    //  Send a notification(sms) to the user
    const { mobile_number: mobileNumber } = patient.value;

    await appointmentEndedSms({
      doctorName: `${doctorFirstName} ${doctorLastName}`,
      patientName: `${firstName} ${lastName}`,
      mobileNumber,
    });

    return Response.SUCCESS({
      message: "Appointment Ended Successfully",
    });
  } catch (error) {
    console.log(error);
    logger.error("APPOINTMENT END ERROR:", error);
    throw error;
  }
};

exports.cancelDoctorAppointment = async ({
  userId,
  appointmentId,
  cancelReason,
}) => {
  try {
    const user = await getUserById(userId);

    if (!user) {
      return Response.NOT_FOUND({ message: "User Not Found" });
    }

    const { user_type: userType } = user;

    if (userType !== USERTYPE.DOCTOR) {
      return Response.UNAUTHORIZED({ message: "Unauthorized access" });
    }

    const doctor = await getDoctorByUserId(userId);

    if (!doctor) {
      return Response.NOT_FOUND({
        message:
          "Doctor Profile Not Found. Please Register As a Doctor and Create a Doctor's Profile",
      });
    }
    const { is_profile_approved: isProfileApproved, doctor_id: doctorId } =
      doctor;

    if (isProfileApproved !== VERIFICATIONSTATUS.VERIFIED) {
      return Response.UNAUTHORIZED({
        message:
          "Doctor's Profile has not been approved by admin. Please contact admin for profile approval and try again",
      });
    }

    // TODO Check if the appointment exist
    const rawData = await dbObject.getDoctorAppointmentById({
      doctorId,
      appointmentId,
    });
    if (!rawData) {
      return Response.NOT_FOUND({ message: "Appointment Not Found" });
    }

    // Extract patient id from appointment to get patient email
    const { patient_id: patientId, appointment_status: appointmentStatus } =
      rawData;

    console.log(patientId);
    if (appointmentStatus === "canceled") {
      return Response.NOT_MODIFIED();
    }

    // TODO Check the appointment date and time
    // TODO Appointment's can only be cancelled 24 hours before the appointment date

    // UPDATE appointment status to 'approved'
    await dbObject.cancelDoctorAppointmentById({
      appointmentId,
      doctorId,
      cancelReason,
    });

    // TODO Send a notification(email,sms) to the user

    return Response.SUCCESS({
      message:
        "Appointment Canceled Successfully. An email has been sent to the patient",
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
};
exports.postponeDoctorAppointment = async ({
  userId,
  appointmentId,
  postponedReason,
  postponedDate,
  postponedTime,
}) => {
  try {
    const user = await getUserById(userId);

    if (!user) {
      return Response.NOT_FOUND({ message: "User Not Found" });
    }

    const { user_type: userType } = user;

    if (userType !== USERTYPE.DOCTOR) {
      return Response.UNAUTHORIZED({ message: "Unauthorized access" });
    }

    const doctor = await getDoctorByUserId(userId);

    if (!doctor) {
      return Response.UNAUTHORIZED({
        message:
          "Unauthorized Access. This action can only be performed by a doctor",
      });
    }
    const { doctor_id: doctorId } = doctor;

    //  Check if the appointment exist
    const rawData = await dbObject.getDoctorAppointmentById({
      doctorId,
      appointmentId,
    });
    if (!rawData) {
      return Response.NOT_FOUND({
        message: "Appointment Not Found",
      });
    }
    const {
      patient_id: patientId,
      appointment_status: appointmentStatus,
      patient_name_on_prescription: patientNameOnPrescription,
      first_name: patientFirstName,
      last_name: patientLastName,
      doctor_first_name: doctorFirstName,
      doctor_last_name: doctorLastName,
    } = rawData;

    if (appointmentStatus === "postponed") {
      return Response.NOT_MODIFIED();
    }

    // check if the date and time has already been booked
    const timeSlotBooked = await dbObject.getDoctorAppointByDateAndTime({
      doctorId,
      date: postponedDate,
      time: postponedTime,
    });

    if (timeSlotBooked) {
      return Response.BAD_REQUEST({
        message:
          "An appointment has already been booked for the specified time on that date. Please choose another time.",
      });
    }
    const { mobile_number: mobileNumber } = await getPatientById(patientId);
    // UPDATE appointment status to 'approved'
    await dbObject.postponeDoctorAppointmentById({
      postponedReason,
      postponedDate,
      postponedTime,
      appointmentId,
      doctorId,
    });

    // Send a notification(email,sms) to the user
    await appointmentPostponedSms({
      patientName: `${patientFirstName} ${patientLastName}`,
      patientNameOnPrescription,
      mobileNumber,
      doctorName: `${doctorFirstName} ${doctorLastName}`,
      appointmentDate: postponedDate,
      appointmentTime: postponedTime,
    });

    return Response.SUCCESS({
      message:
        "Appointment has been postponed successfully and user has been notified. Please ensure to complete appointment on the rescheduled date.",
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
};
