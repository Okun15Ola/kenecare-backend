const {
  getDoctorAppointByDateAndTime,
  getDoctorAppointmentById,
} = require("../../repository/doctorAppointments.repository");
const { getDoctorByUserId } = require("../../repository/doctors.repository");
const followUpRepo = require("../../repository/follow-up.repository");
const { getPatientById } = require("../../repository/patients.repository");
const Response = require("../../utils/response.utils");
const { newFollowAppointmentSms } = require("../../utils/sms.utils");
const redisClient = require("../../config/redis.config");
const { mapFollowUpRow } = require("../../utils/db-mapper.utils");

exports.createFollowUp = async ({
  appointmentId,
  followUpDate,
  followUpTime,
  followUpReason,
  followUpType,
  userId,
}) => {
  try {
    const doctor = await getDoctorByUserId(userId);

    if (!doctor) {
      return Response.UNAUTHORIZED({
        message:
          "UnAuthorized Action. Please Login as a doctor before proceeding",
      });
    }

    const {
      doctor_id: doctorId,
      first_name: doctorFirstName,
      title: doctorTitle,
      last_name: doctorLastName,
    } = doctor;

    // Check if an appointment has not been booked on the selected followup date
    const appointmentBookedOnFollowUpDateAndTime =
      await getDoctorAppointByDateAndTime({
        doctorId,
        date: followUpDate,
        time: followUpTime,
      });

    if (appointmentBookedOnFollowUpDateAndTime) {
      return Response.BAD_REQUEST({
        message:
          "An Appointment Has Already Been Booked for the Specified Date/Time slot. Please Select Another Date or Time",
      });
    }

    const followUpDateAndTimeSlotBooked =
      await followUpRepo.getDoctorsFollowByDateAndTime({
        doctorId,
        followUpDate,
        followUpTime,
      });

    if (followUpDateAndTimeSlotBooked) {
      return Response.BAD_REQUEST({
        message:
          "You have a follow-up for the selected date and time, please choose another date or time.",
      });
    }

    const appointment = await getDoctorAppointmentById({
      doctorId,
      appointmentId,
    });

    const {
      patient_id: patientId,
      patient_name_on_prescription: patientNameOnPrescription,
    } = appointment;
    const { mobile_number: mobileNumber } = await getPatientById(patientId);

    // Save follow-up to database
    await followUpRepo.createNewFollowUp({
      appointmentId,
      followUpDate,
      followUpTime,
      followUpReason,
      followUpType,
      doctorId,
    });

    //  Send notfication to user for new follow-up
    await newFollowAppointmentSms({
      patientNameOnPrescription,
      mobileNumber,
      doctorName: `${doctorTitle} ${doctorFirstName} ${doctorLastName}`,
      followUpDate,
      followUpTime,
    });

    return Response.CREATED({
      message: "Appointment Follow-up created successfully",
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.updateAppointmentFollowUpService = async ({
  followUpId,
  appointmentId,
  followUpDate,
  followUpTime,
  followUpReason,
  followUpType,
  userId,
}) => {
  try {
    const doctor = await getDoctorByUserId(userId);

    if (!doctor) {
      return Response.UNAUTHORIZED({
        message:
          "UnAuthorized Action. Please Login as a doctor before proceeding",
      });
    }

    const { doctor_id: doctorId } = doctor;

    // check if the appointment belongs to the requesting doctor
    const isDoctorsAppointment = await getDoctorAppointmentById({
      doctorId,
      appointmentId,
    });

    if (!isDoctorsAppointment) {
      return Response.UNAUTHORIZED({
        message: "UnAuthorized Action.",
      });
    }

    // Check if an appointment has not been booked on the selected followup date
    const appointmentBookedOnFollowUpDateAndTime =
      await getDoctorAppointByDateAndTime({
        doctorId,
        date: followUpDate,
        time: followUpTime,
      });

    if (appointmentBookedOnFollowUpDateAndTime) {
      return Response.BAD_REQUEST({
        message:
          "An Appointment Has Already Been Booked for the Specified Date/Time slot. Please Select Another Date or Time",
      });
    }

    const followUpDateAndTimeSlotBooked =
      await followUpRepo.getDoctorsFollowByDateAndTime({
        doctorId,
        followUpDate,
        followUpTime,
      });

    if (followUpDateAndTimeSlotBooked) {
      return Response.BAD_REQUEST({
        message:
          "You have a follow-up for the selected date and time, please choose another date or time.",
      });
    }

    // const appointment = await getDoctorAppointmentById({
    //   doctorId,
    //   appointmentId,
    // });

    // const {
    //   patient_id: patientId,
    //   patient_name_on_prescription: patientNameOnPrescription,
    // } = appointment;
    // const { mobile_number: mobileNumber } = await getPatientById(patientId);

    // Save follow-up to database
    await followUpRepo.updateAppointmentFollowUp({
      followUpId,
      appointmentId,
      followUpDate,
      followUpTime,
      followUpReason,
      followUpType,
      doctorId,
    });

    return Response.SUCCESS({
      message: "Appointment Follow-up updated successfully",
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.getAllAppointmentFollowupService = async ({
  userId,
  appointmentId,
}) => {
  try {
    const cacheKey = `doctor-appointment-follow-up:${userId}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }

    const doctor = await getDoctorByUserId(userId);

    if (!doctor) {
      return Response.UNAUTHORIZED({
        message:
          "UnAuthorized Action. Please Login as a doctor before proceeding",
      });
    }
    const { doctor_id: doctorId } = doctor;

    // check if the appointment belongs to the requesting doctor
    const isDoctorsAppointment = await getDoctorAppointmentById({
      doctorId,
      appointmentId,
    });

    if (!isDoctorsAppointment) {
      return Response.UNAUTHORIZED({
        message: "UnAuthorized Action.",
      });
    }

    const rawData = await followUpRepo.getAppointmentFollowUps(appointmentId);

    const followUps = rawData?.map(mapFollowUpRow) || [];

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(followUps),
    });
    return Response.SUCCESS({
      data: followUps,
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.getFollowUpByIdService = async ({ userId, id }) => {
  try {
    const cacheKey = `doctor-appointment-follow-up-by-id:${id}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }

    const { doctor_id: doctorId } = await getDoctorByUserId(userId);
    if (!doctorId) {
      return Response.UNAUTHORIZED({
        message: "UnAuthorized Action.",
      });
    }

    const rawData = await followUpRepo.getDoctorFollowUpById({
      followUpId: id,
      doctorId,
    });

    if (!rawData) {
      return Response.NOT_FOUND({ message: "Follow up not found" });
    }

    const followUp = mapFollowUpRow(rawData);

    return Response.SUCCESS({
      data: followUp,
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
exports.deleteAppointmentFollowUpService = async ({ followUpId, userId }) => {
  try {
    const followUp = await followUpRepo.getFollowUpById(followUpId);
    if (!followUp) {
      return Response.NOT_FOUND({ message: "Follow-up not found" });
    }
    // TODO move to middleware function
    const doctor = await getDoctorByUserId(userId);
    if (!doctor) {
      return Response.UNAUTHORIZED({
        message:
          "UnAuthorized Action. Please Login as a doctor before proceeding",
      });
    }

    const { appointment_id: appointmentId } = followUp;
    const { doctor_id: doctorId } = doctor;

    // check if the appointment belongs to the requesting doctor
    const isDoctorsAppointment = await getDoctorAppointmentById({
      doctorId,
      appointmentId,
    });

    console.log(isDoctorsAppointment);

    if (!isDoctorsAppointment) {
      return Response.UNAUTHORIZED({
        message: "UnAuthorized Action.",
      });
    }

    // Save follow-up to database
    await followUpRepo.deleteAppointmentFollowUp(followUpId);

    return Response.SUCCESS({
      message: "Appointment Follow-up Deleted Successfully",
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
