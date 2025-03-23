const dbObject = require("../../db/db.appointments.admin");
const Response = require("../../utils/response.utils");
const redisClient = require("../../config/redis.config");

exports.getAdminppointments = async ({ page, limit }) => {
  try {
    const cacheKey = "admin-appointments:all";
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }
    const rawData = await dbObject.getAllAppointments({ page, limit });

    const appointments = rawData.map(
      ({
        appointment_id: appointmentId,
        appointment_uuid: appointmentUUID,
        patient_id: patient,
        first_name: firstName,
        last_name: lastName,
        doctor_id: doctorId,
        doc_first_name: doctorFirstName,
        doc_last_name: doctorLastName,
        appointment_type: appointmentType,
        patient_name_on_prescription: patientNameOnPrescription,
        patient_mobile_number: patientMobileNumber,
        patient_symptoms: patientSymptoms,
        consultation_fee: consultationFees,
        specialty_name: specialty,
        time_slot: timeSlot,
        meeting_id: meetingId,
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
      }) => ({
        appointmentId,
        appointmentUUID,
        patient,
        username: `${firstName} ${lastName}`,
        doctorId,
        doctor: `Dr. ${doctorFirstName} ${doctorLastName}`,
        appointmentType,
        patientNameOnPrescription,
        patientMobileNumber,
        patientSymptoms,
        consultationFees: `${parseInt(consultationFees, 10)}`,
        specialty,
        timeSlot,
        meetingId,
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
      }),
    );

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(appointments),
    });
    return Response.SUCCESS({ data: appointments });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
exports.getAdminAppointmentsByDoctorId = async (doctorId) => {
  try {
    const cacheKey = `admin-appointments-by-doctor-id:${doctorId}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }
    const rawData = await dbObject.getAppointmentsByDoctorId(doctorId);

    const appointments = rawData.map(
      ({
        appointment_id: appointmentId,
        appointment_uuid: appointmentUUID,
        patient_id: patient,
        first_name: firstName,
        last_name: lastName,
        doctor_id: doctorId,
        doc_first_name: doctorFirstName,
        doc_last_name: doctorLastName,
        appointment_type: appointmentType,
        patient_name_on_prescription: patientNameOnPrescription,
        patient_mobile_number: patientMobileNumber,
        patient_symptoms: patientSymptoms,
        consultation_fee: consultationFees,
        specialty_name: specialty,
        time_slot: timeSlot,
        meeting_id: meetingId,
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
      }) => ({
        appointmentId,
        appointmentUUID,
        patient,
        username: `${firstName} ${lastName}`,
        doctorId,
        doctor: `Dr. ${doctorFirstName} ${doctorLastName}`,
        appointmentType,
        patientNameOnPrescription,
        patientMobileNumber,
        patientSymptoms,
        consultationFees: `${parseInt(consultationFees, 10)}`,
        specialty,
        timeSlot,
        meetingId,
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
      }),
    );

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(appointments),
    });

    return Response.SUCCESS({ data: appointments });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.getAdminAppointmentById = async (id) => {
  try {
    const cacheKey = `admin-appointments:${id}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }
    const rawData = await dbObject.getAppointmentById(id);

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
      doc_first_name: doctorFirstName,
      doc_last_name: doctorLastName,
      appointment_type: appointmentType,
      patient_name_on_prescription: patientNameOnPrescription,
      patient_mobile_number: patientMobileNumber,
      patient_symptoms: patientSymptoms,
      consultation_fee: consultationFees,
      specialty_name: specialty,
      time_slot: timeSlot,
      meeting_id: meetingId,
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
      username: `${firstName} ${lastName}`,
      patient,
      doctorId,
      doctor: `Dr. ${doctorFirstName} ${doctorLastName}`,
      appointmentType,
      patientNameOnPrescription,
      patientMobileNumber,
      patientSymptoms,
      consultationFees: `${parseInt(consultationFees, 10)}`,
      specialty,
      timeSlot,
      meetingId,
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

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(appointment),
    });
    return Response.SUCCESS({ data: appointment });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.getAdminAppointmentByUUID = async (uuid) => {
  try {
    const cacheKey = `admin-appointments-by-uuid:${uuid}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }
    const rawData = await dbObject.getAppointmentByUUID(uuid);

    const {
      appointment_id: appointmentId,
      appointment_uuid: appointmentUUID,
      patient_id: patient,
      first_name: firstName,
      last_name: lastName,
      doctor_id: doctorId,
      doc_first_name: doctorFirstName,
      doc_last_name: doctorLastName,
      appointment_type: appointmentType,
      patient_name_on_prescription: patientNameOnPrescription,
      patient_mobile_number: patientMobileNumber,
      patient_symptoms: patientSymptoms,
      consultation_fee: consultationFees,
      specialty_name: specialty,
      time_slot: timeSlot,
      meeting_id: meetingId,
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
      username: `${firstName} ${lastName}`,
      patient,
      doctorId,
      doctor: `Dr. ${doctorFirstName} ${doctorLastName}`,
      appointmentType,
      patientNameOnPrescription,
      patientMobileNumber,
      patientSymptoms,
      consultationFees: `SLE ${parseInt(consultationFees, 10)}`,
      specialty,
      timeSlot,
      meetingId,
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

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(appointment),
    });
    return Response.SUCCESS({ data: appointment });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
