const {
  getDoctorAppointByDateAndTime,
  getDoctorAppointmentById,
} = require("../../repository/doctorAppointments.repository");
const { getDoctorByUserId } = require("../../repository/doctors.repository");
const followUpRepo = require("../../repository/follow-up.repository");
const { getPatientById } = require("../../repository/patients.repository");
const Response = require("../../utils/response.utils");
const { newFollowAppointmentSms } = require("../../utils/sms.utils");
const { redisClient } = require("../../config/redis.config");
const { mapFollowUpRow } = require("../../utils/db-mapper.utils");
const logger = require("../../middlewares/logger.middleware");

exports.getDoctorFollowUpMetrics = async (userId) => {
  try {
    const { doctor_id: doctorId } = await getDoctorByUserId(userId);

    if (!doctorId) {
      logger.warn(`Doctor Profile Not Found for user ${userId}`);
      return Response.NOT_FOUND({
        message:
          "Doctor profile not found please, create profile before proceeding",
      });
    }

    const cacheKey = `doctor:${doctorId}:follow-up-metrics`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }

    const data = await followUpRepo.countDoctorFollowUp(doctorId);

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(data),
    });

    return Response.SUCCESS({ data });
  } catch (error) {
    logger.error("getDoctorFollowUpMetrics: ", error);
    throw error;
  }
};

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
      logger.error(`Doctor not found for userId: ${userId}`);
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
      logger.error(
        `Appointment already booked for doctorId: ${doctorId} on date: ${followUpDate} at time: ${followUpTime}`,
      );
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
      logger.error(
        `Follow-up already exists for doctorId: ${doctorId} on date: ${followUpDate} at time: ${followUpTime}`,
      );
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

    const { insertId } = await followUpRepo.createNewFollowUp({
      appointmentId,
      followUpDate,
      followUpTime,
      followUpReason,
      followUpType,
      doctorId,
    });

    if (!insertId) {
      logger.error(
        `Failed to create follow-up for appointmentId: ${appointmentId} by doctorId: ${doctorId}`,
      );
      return Response.INTERNAL_SERVER_ERROR({
        message: "Failed to create follow-up. Please try again later.",
      });
    }

    //  Send notfication to user for new follow-up
    await newFollowAppointmentSms({
      patientNameOnPrescription,
      mobileNumber,
      doctorName: `${doctorTitle} ${doctorFirstName} ${doctorLastName}`,
      followUpDate,
      followUpTime,
    });

    await redisClient.clearCacheByPattern("doctor:*");

    return Response.CREATED({
      message: "Appointment Follow-up created successfully",
    });
  } catch (error) {
    logger.error("createFollowUp: ", error);
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
      logger.error(`Doctor not found for userId: ${userId}`);
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
      logger.error(
        `Unauthorized action: Appointment with id ${appointmentId} does not belong to doctorId: ${doctorId}`,
      );
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
      logger.error(
        `Appointment already booked for doctorId: ${doctorId} on date: ${followUpDate} at time: ${followUpTime}`,
      );
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
      logger.error(
        `Follow-up already exists for doctorId: ${doctorId} on date: ${followUpDate} at time: ${followUpTime}`,
      );
      return Response.BAD_REQUEST({
        message:
          "You have a follow-up for the selected date and time, please choose another date or time.",
      });
    }

    const { affectedRows } = await followUpRepo.updateAppointmentFollowUp({
      followUpId,
      appointmentId,
      followUpDate,
      followUpTime,
      followUpReason,
      followUpType,
    });

    if (!affectedRows || affectedRows < 1) {
      logger.error(
        `Failed to update follow-up with id: ${followUpId} for appointmentId: ${appointmentId} by doctorId: ${doctorId}`,
      );
      return Response.NOT_MODIFIED({});
    }

    await redisClient.clearCacheByPattern("doctor:*");

    return Response.SUCCESS({
      message: "Appointment Follow-up updated successfully",
    });
  } catch (error) {
    logger.error("updateAppointmentFollowUpService: ", error);
    throw error;
  }
};

exports.getAllAppointmentFollowupService = async ({
  userId,
  appointmentId,
}) => {
  try {
    const cacheKey = `doctor:appointment:follow-up:${userId}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }
    const doctor = await getDoctorByUserId(userId);

    if (!doctor) {
      logger.error(`Doctor not found for userId: ${userId}`);
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
      logger.error(
        `Unauthorized action: Appointment with id ${appointmentId} does not belong to doctorId: ${doctorId}`,
      );
      return Response.UNAUTHORIZED({
        message:
          "You don't have permission to access this appointment. This appointment either doesn't exist or belongs to another doctor.",
      });
    }

    const rawData = await followUpRepo.getAppointmentFollowUps(appointmentId);

    if (!rawData?.length) {
      return Response.SUCCESS({ message: "No follow-ups found", data: [] });
    }

    const followUps = rawData.map(mapFollowUpRow);

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(followUps),
    });
    return Response.SUCCESS({
      data: followUps,
    });
  } catch (error) {
    logger.error("getAllAppointmentFollowupService: ", error);
    throw error;
  }
};

exports.getFollowUpByIdService = async ({ userId, id }) => {
  try {
    const cacheKey = `doctor:appointment:follow-up:${id}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }

    const { doctor_id: doctorId } = await getDoctorByUserId(userId);
    if (!doctorId) {
      logger.error(`Doctor not found for userId: ${userId}`);
      return Response.UNAUTHORIZED({
        message: "UnAuthorized Action.",
      });
    }

    const rawData = await followUpRepo.getDoctorFollowUpById({
      followUpId: id,
      doctorId,
    });

    if (!rawData) {
      logger.error(
        `Follow-up not found for id: ${id} by doctorId: ${doctorId}`,
      );
      return Response.NOT_FOUND({ message: "Follow up not found" });
    }

    const followUp = mapFollowUpRow(rawData);

    return Response.SUCCESS({
      data: followUp,
    });
  } catch (error) {
    logger.error("getFollowUpByIdService: ", error);
    throw error;
  }
};
exports.deleteAppointmentFollowUpService = async ({ followUpId, userId }) => {
  try {
    const followUp = await followUpRepo.getFollowUpById(followUpId);
    if (!followUp) {
      logger.error(`Follow-up not found for followUpId: ${followUpId}`);
      return Response.NOT_FOUND({ message: "Follow-up not found" });
    }

    const doctor = await getDoctorByUserId(userId);
    if (!doctor) {
      logger.error(`Doctor not found for userId: ${userId}`);
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

    if (!isDoctorsAppointment) {
      logger.error(
        `Unauthorized action: Appointment with id ${appointmentId} does not belong to doctorId: ${doctorId}`,
      );
      return Response.UNAUTHORIZED({
        message: "UnAuthorized Action.",
      });
    }

    // Save follow-up to database
    const { affectedRows } =
      await followUpRepo.deleteAppointmentFollowUp(followUpId);

    if (!affectedRows || affectedRows < 1) {
      logger.error(
        `Failed to delete follow-up with id: ${followUpId} for appointmentId: ${appointmentId} by doctorId: ${doctorId}`,
      );
      return Response.NOT_MODIFIED({});
    }

    // Invalidate cache
    await redisClient.clearCacheByPattern("doctor:*");

    return Response.SUCCESS({
      message: "Appointment Follow-up Deleted Successfully",
    });
  } catch (error) {
    logger.error("deleteAppointmentFollowUpService: ", error);
    throw error;
  }
};
