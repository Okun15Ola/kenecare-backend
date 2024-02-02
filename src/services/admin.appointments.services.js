const dbObject = require("../db/db.appointments.admin");
const Response = require("../utils/response.utils");

exports.getAdminppointments = async () => {
  try {
    const rawData = await dbObject.getAllAppointments();

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
      }) => {
        return {
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
          consultationFees: `${parseInt(consultationFees)}`,
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
      }
    );

    return Response.SUCCESS({ data: appointments });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
exports.getAdminAppointmentsByDoctorId = async (doctorId) => {
  try {
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
      }) => {
        return {
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
          consultationFees: `${parseInt(consultationFees)}`,
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
      }
    );

    return Response.SUCCESS({ data: appointments });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.getAdminAppointmentById = async (id) => {
  try {
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
      consultationFees: `${parseInt(consultationFees)}`,
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

exports.getAdminAppointmentByUUID = async (uuid) => {
  try {
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
      consultationFees: `SLE ${parseInt(consultationFees)}`,
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
