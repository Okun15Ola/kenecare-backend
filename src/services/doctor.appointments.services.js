const dbObject = require("../db/db.appointments.doctors");
const { getDoctorByUserId } = require("../db/db.doctors");
const { getUserById } = require("../db/db.users");
const { USERTYPE, VERIFICATIONSTATUS } = require("../utils/enum.utils");
const Response = require("../utils/response.utils");
const { doctorAppointmentApprovalEmail } = require("../utils/email.utils");
const { getPatientById } = require("../db/db.patients");

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

    const {
      is_profile_approved,
      doctor_id: doctorId,
      first_name: doctorFirstName,
      last_name: doctorLastName,
    } = doctor;

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
      first_name: firstName,
      last_name: lastName,
      patient_name_on_prescription: patientNameOnPrescription,
      appointment_date: appointmentDate,
      appointment_time: appoinmentTime,
      patient_symptoms: symptoms,
      appointment_status,
    } = rawData;

    // SEND A RESPONSE IF THE APPOINTMENT HAS PREVIOUSLY BEEN APPROVED
    if (appointment_status === "approved") {
      return Response.NOT_MODIFIED();
    }

    //UPDATE appointment status to 'approved'
    await dbObject.approveDoctorAppointmentById({
      appointmentId,
      doctorId,
    });

    const patient = await getPatientById(patientId);

    if (patient) {
      const { email } = patient || null;

      if (email) {
        // Send a email notification to the user
        await doctorAppointmentApprovalEmail({
          doctorName: `${doctorFirstName} ${doctorLastName}`,
          patientName: `${firstName} ${lastName}`,
          patientNameOnPrescription,
          appointmentDate,
          appoinmentTime,
          symptoms,
          meetingJoinLink:
            "https://us02web.zoom.us/j/81495440003?pwd=dUpYSWZxWW9FdjdkRG9NVTFkUFd5UT09",
          patientEmail: email,
        });
      } else {
        //TODO SEND AN SMS NOTIFICATION TO PATIENT FOR APPROVED APPOINTMENT
      }
    }

    return Response.SUCCESS({
      message: "Medical Appointment Approved Successfully",
    });
  } catch (error) {
    throw error;
  }
};
exports.startDoctorAppointment = async ({ userId, appointmentId }) => {
  try {
    const user = await getUserById(userId);

    if (!user) {
      return Response.NOT_FOUND({ message: "User Not Found" });
    }

    const { user_type } = user;

    if (user_type !== USERTYPE.DOCTOR) {
      return Response.UNAUTHORIZED({
        message:
          "Unauthorized access. You must register as a doctor to perform this action",
      });
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

    // Get doctor's appointment by ID
    const rawData = await dbObject.getDoctorAppointmentById({
      doctorId,
      appointmentId,
    });

    //Check if the appointment exists
    if (!rawData) {
      return Response.NOT_FOUND({
        message: "Specified Appointment Not Found! Please Try Again!",
      });
    }

    //Extract patient id from appointment to get patient email
    const {
      patient_id: patientId,
      patient_mobile_number,
      appointment_status,
    } = rawData;

    if (appointment_status !== "approved") {
      //UPDATE appointment status to 'approved'
      await dbObject.approveDoctorAppointmentById({
        appointmentId,
        doctorId,
      });
    }

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
