const dbObject = require("../db/db.appointments.doctors");
const { getDoctorByUserId } = require("../db/db.doctors");
const { getUserById } = require("../db/db.users");
const { USERTYPE, VERIFICATIONSTATUS } = require("../utils/enum.utils");
const Response = require("../utils/response.utils");

exports.getDoctorAppointments = async (userId) => {
  try {
    const user = await getUserById(userId);

    if (!user) {
      return Response.NOT_FOUND({ message: "User Not Found" });
    }

    const { user_type } = user;

    if (user_type !== USERTYPE.DOCTOR) {
      return Response.UNAUTHORIZED({ message: "Unauthorized access" });
    }

    const doctor = await getDoctorByUserId(userId);

    if (!doctor) {
      return Response.NOT_FOUND({
        message:
          "Doctor Profile Not Found. Please Register As a Doctor and Create a Doctor's Profile",
      });
    }

    const { is_profile_approved, doctor_id: doctorId } = doctor;

    // if (is_profile_approved !== VERIFICATIONSTATUS.VERIFIED) {
    //   return Response.UNAUTHORIZED({
    //     message:
    //       "Doctor's Profile has not been approved by admin. Please contact admin for profile approval and try again",
    //   });
    // }

    //Get doctor's appointments
    const rawData = await dbObject.getAppointmentsByDoctorId(doctorId);
    const appointments = rawData.map(
      ({
        appointment_id: appointmentId,
        appointment_uuid: appointmentUUID,
        patient_id: patient,
        first_name: firstName,
        last_name: lastName,
        doctor_id: doctor,
        appointment_type: appointmentType,
        patient_name_on_prescription: patientNameOnPrescription,
        patient_mobile_number: patientMobileNumber,
        patient_symptoms: patientSymptoms,
        consultation_fee: consultationFees,
        speciality_name: specialty,
        time_slot: timeSlot,
        meeting_url: meetingUrl,
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
          meetingUrl,
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

exports.getDoctorAppointment = async ({ userId, appointmentId }) => {
  try {
    const user = await getUserById(userId);

    if (!user) {
      return Response.NOT_FOUND({ message: "User Not Found" });
    }

    const { user_type } = user;

    if (user_type !== USERTYPE.DOCTOR) {
      return Response.UNAUTHORIZED({ message: "Unauthorized access" });
    }

    const doctor = await getDoctorByUserId(userId);

    if (!doctor) {
      return Response.NOT_FOUND({
        message:
          "Doctor Profile Not Found. Please Register As a Doctor and Create a Doctor's Profile",
      });
    }

    const { is_profile_approved, doctor_id: doctorId } = doctor;

    // if (is_profile_approved !== VERIFICATIONSTATUS.VERIFIED) {
    //   return Response.UNAUTHORIZED({
    //     message:
    //       "Doctor's Profile has not been approved by admin. Please contact admin for profile approval and try again",
    //   });
    // }

    const rawData = await dbObject.getDoctorAppointmentById({
      appointmentId,
      doctorId,
    });

    const {
      appointment_id: id,
      appointment_uuid: appointmentUUID,
      first_name: firstName,
      last_name: lastName,
      appointment_type: appointmentType,
      patient_name_on_prescription: patientNameOnPrescription,
      patient_mobile_number: patientMobileNumber,
      patient_symptoms: patientSymptoms,
      consultation_fee_paid: consultationFees,
      specialty_name: specialty,
      time_slot: timeSlot,
      meeting_url: meetingUrl,
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
      appointmentId: id,
      appointmentUUID,
      username: `${firstName} ${lastName}`,
      appointmentType,
      patientNameOnPrescription,
      patientMobileNumber,
      patientSymptoms,
      consultationFees,
      specialty,
      timeSlot,
      meetingUrl,
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

exports.approveDoctorAppointment = async ({ userId, appointmentId }) => {
  try {
    const user = await getUserById(userId);

    if (!user) {
      return Response.NOT_FOUND({ message: "User Not Found" });
    }

    const { user_type } = user;

    if (user_type !== USERTYPE.DOCTOR) {
      return Response.UNAUTHORIZED({ message: "Unauthorized access" });
    }

    const doctor = await getDoctorByUserId(userId);

    if (!doctor) {
      return Response.NOT_FOUND({
        message:
          "Doctor Profile Not Found. Please Register As a Doctor and Create a Doctor's Profile",
      });
    }
    const { is_profile_approved, doctor_id: doctorId } = doctor;

    // if (is_profile_approved !== VERIFICATIONSTATUS.VERIFIED) {
    //   return Response.UNAUTHORIZED({
    //     message:
    //       "Doctor's Profile has not been approved by admin. Please contact admin for profile approval and try again",
    //   });
    // }

    //TODO Check if the appointment exist
    const rawData = await dbObject.getDoctorAppointmentById({
      doctorId,
      appointmentId,
    });
    if (!rawData) {
      return Response.NOT_FOUND({ message: "Appointment Not Found" });
    }

    //Extract patient id from appointment to get patient email
    const {
      patient_id: patientId,
      patient_mobile_number,
      appointment_status,
    } = rawData;

    if (appointment_status === "approved") {
      return Response.NOT_MODIFIED();
    }

    //UPDATE appointment status to 'approved'
    await dbObject.approveDoctorAppointmentById({
      appointmentId,
      doctorId,
    });

    //TODO Send a notification(email,sms) to the user

    return Response.SUCCESS({ message: "Appointment Approved Successfully" });
  } catch (error) {
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

    const { user_type } = user;

    if (user_type !== USERTYPE.DOCTOR) {
      return Response.UNAUTHORIZED({ message: "Unauthorized access" });
    }

    const doctor = await getDoctorByUserId(userId);

    if (!doctor) {
      return Response.NOT_FOUND({
        message:
          "Doctor Profile Not Found. Please Register As a Doctor and Create a Doctor's Profile",
      });
    }
    const { is_profile_approved, doctor_id: doctorId } = doctor;

    // if (is_profile_approved !== VERIFICATIONSTATUS.VERIFIED) {
    //   return Response.UNAUTHORIZED({
    //     message:
    //       "Doctor's Profile has not been approved by admin. Please contact admin for profile approval and try again",
    //   });
    // }

    //TODO Check if the appointment exist
    const rawData = await dbObject.getDoctorAppointmentById({
      doctorId,
      appointmentId,
    });
    if (!rawData) {
      return Response.NOT_FOUND({ message: "Appointment Not Found" });
    }

    //Extract patient id from appointment to get patient email
    const {
      patient_id: patientId,
      patient_mobile_number,
      appointment_status,
    } = rawData;

    if (appointment_status === "canceled") {
      return Response.NOT_MODIFIED();
    }

    //TODO Check the appointment date and time
    //TODO Appointment's can only be cancelled 24 hours before the appointment date

    //UPDATE appointment status to 'approved'
    const done = await dbObject.cancelDoctorAppointmentById({
      appointmentId,
      doctorId,
      cancelReason,
    });

    console.log(done);

    //TODO Send a notification(email,sms) to the user

    return Response.SUCCESS({
      message:
        "Appointment Canceled Successfully. An email has been sent to the patient",
    });
  } catch (error) {
    throw error;
  }
};
exports.postponeDoctorAppointment = async ({
  userId,
  appointmentId,
  postponedReason,
  postponeDate,
}) => {
  try {
    const user = await getUserById(userId);

    if (!user) {
      return Response.NOT_FOUND({ message: "User Not Found" });
    }

    const { user_type } = user;

    if (user_type !== USERTYPE.DOCTOR) {
      return Response.UNAUTHORIZED({ message: "Unauthorized access" });
    }

    const doctor = await getDoctorByUserId(userId);

    if (!doctor) {
      return Response.NOT_FOUND({
        message:
          "Doctor Profile Not Found. Please Register As a Doctor and Create a Doctor's Profile",
      });
    }
    const { is_profile_approved, doctor_id: doctorId } = doctor;

    // if (is_profile_approved !== VERIFICATIONSTATUS.VERIFIED) {
    //   return Response.UNAUTHORIZED({
    //     message:
    //       "Doctor's Profile has not been approved by admin. Please contact admin for profile approval and try again",
    //   });
    // }

    //TODO Check if the appointment exist
    const rawData = await dbObject.getDoctorAppointmentById({
      doctorId,
      appointmentId,
    });
    if (!rawData) {
      return Response.NOT_FOUND({ message: "Appointment Not Found" });
    }

    //Extract patient id from appointment to get patient email
    const {
      patient_id: patientId,
      patient_mobile_number,
      appointment_status,
    } = rawData;

    if (appointment_status === "postponed") {
      return Response.NOT_MODIFIED();
    }

    //UPDATE appointment status to 'approved'
    await dbObject.postponeDoctorAppointmentById({
      appointmentId,
      doctorId,
    });

    //TODO Send a notification(email,sms) to the user

    return Response.SUCCESS({
      message:
        "Appointment has been postponed successfully and user has been notified. Please ensure to complete appointment on the rescheduled date.",
    });
  } catch (error) {
    throw error;
  }
};
exports.getDoctorAppointmentByDate = async ({ id, status }) => {
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
exports.getDoctorAppointmentByDateRange = async ({ id, status }) => {
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
