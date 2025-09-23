const moment = require("moment");
const dbObject = require("../../repository/doctorAppointments.repository");
const { VERIFICATIONSTATUS } = require("../../utils/enum.utils");
const Response = require("../../utils/response.utils");
const { getPatientById } = require("../../repository/patients.repository");
const {
  appointmentApprovalSms,
  appointmentPostponedSms,
  appointmentEndedSms,
  doctorAppointmentCancelledSms,
} = require("../../utils/sms.utils");
const logger = require("../../middlewares/logger.middleware");
const {
  getAppointmentFollowUps,
} = require("../../repository/follow-up.repository");
const { createStreamCall, endStreamCall } = require("../../utils/stream.utils");
const { nodeEnv } = require("../../config/default.config");
const { redisClient } = require("../../config/redis.config");
const {
  mapDoctorAppointmentRow,
  mapFollowUpsRow,
} = require("../../utils/db-mapper.utils");
const {
  // cacheKeyBulider,
  getPaginationInfo,
} = require("../../utils/caching.utils");
const { decryptText } = require("../../utils/auth.utils");
const { checkDoctorAvailability } = require("../../utils/time.utils");
const {
  getAppointmentCacheKeys,
} = require("../../constants/appointment.constants");
const { fetchLoggedInDoctor } = require("../../utils/helpers.utils");

exports.getDoctorAppointmentMetrics = async (userId) => {
  try {
    const { doctor_id: doctorId } = await fetchLoggedInDoctor(userId);

    if (!doctorId) {
      return Response.NOT_FOUND({
        message:
          "Doctor profile not found please, create profile before proceeding",
      });
    }

    const dashboardCacheKey = `doctor:${doctorId}:appointments:dashboard:metrics`;

    const cachedData = await redisClient.get(dashboardCacheKey);

    if (cachedData) {
      return Response.SUCCESS({
        data: JSON.parse(cachedData),
      });
    }

    const [dashboardMetrics, monthlyMetrics] = await Promise.all([
      dbObject.getDoctorAppointmentsDashboardMetrics({ doctorId }),
      dbObject.getDoctorAppointmentsDashboardMonthlyMetrics({ doctorId }),
    ]);

    if (!dashboardMetrics) {
      logger.error(
        "Error processing appointment dashboard metrices",
        dashboardMetrics,
      );
      return Response.NO_CONTENT();
    }

    if (!monthlyMetrics) {
      logger.error(
        "Error processing appointment monthly metrices",
        monthlyMetrics,
      );
      return Response.NO_CONTENT();
    }

    const responseData = {
      todayAppointments: {
        completed: dashboardMetrics.today_completed_count,
        today: dashboardMetrics.today_upcoming_count,
        canceled: dashboardMetrics.today_canceled_count,
      },
      totalAppointments: {
        total: dashboardMetrics.total_appointment_count,
        pending: dashboardMetrics.total_pending_count,
        postponed: dashboardMetrics.total_postponed_count,
        completed: dashboardMetrics.total_completed_count,
        canceled: dashboardMetrics.total_canceled_count,
        approved: dashboardMetrics.total_approved_count,
      },
      futureAppointments: {
        upcoming: dashboardMetrics.future_approved_count,
        pending: dashboardMetrics.future_pending_count,
        future: dashboardMetrics.future_canceled_count,
      },
      thisYearMonthlyMetrics: monthlyMetrics,
    };

    redisClient.set({
      key: dashboardCacheKey,
      value: JSON.stringify(responseData),
      expiry: 60,
    });

    return Response.SUCCESS({ data: responseData });
  } catch (error) {
    logger.error("getDoctorAppointmentMetrics: ", error);
    throw error;
  }
};

exports.getDoctorAppointments = async ({ userId, limit, page }) => {
  try {
    const doctor = await fetchLoggedInDoctor(userId);

    if (!doctor) {
      logger.error("Doctor profile not found for userId:", userId);
      return Response.NOT_FOUND({
        message:
          "Doctor Profile Not Found. Please Register As a Doctor and Create a Doctor's Profile",
      });
    }

    const { doctor_id: doctorId, title } = doctor;

    const offset = (page - 1) * limit;

    // const cacheKey = cacheKeyBulider(
    //   `doctor:${doctorId}:appointments:all`,
    //   limit,
    //   offset,
    // );
    // const cachedData = await redisClient.get(cacheKey);
    // if (cachedData) {
    //   const { data, pagination } = JSON.parse(cachedData);
    //   return Response.SUCCESS({ data, pagination });
    // }

    // Get doctor's appointments
    const rawData = await dbObject.getAppointmentsByDoctorId({
      doctorId,
      limit,
      offset,
    });

    if (!rawData?.length) {
      return Response.SUCCESS({ message: "No appointments found", data: [] });
    }

    const { totalRows } = rawData[0];

    const paginationInfo = getPaginationInfo({ totalRows, limit, page });

    const appointments = rawData.map((row) =>
      mapDoctorAppointmentRow(row, title),
    );

    // const valueToCache = {
    //   data: appointments,
    //   pagination: paginationInfo,
    // };

    // await redisClient.set({
    //   key: cacheKey,
    //   value: JSON.stringify(valueToCache),
    //   expiry: 300,
    // });
    return Response.SUCCESS({ data: appointments, pagination: paginationInfo });
  } catch (error) {
    logger.error("getDoctorAppointments: ", error);
    throw error;
  }
};

exports.getDoctorAppointment = async ({ userId, id }) => {
  try {
    const doctor = await fetchLoggedInDoctor(userId);
    if (!doctor) {
      logger.error("Doctor profile not found for userId:", userId);
      return Response.NOT_FOUND({
        message:
          "Doctor Profile Not Found. Please Register As a Doctor and Create a Doctor's Profile",
      });
    }

    const { doctor_id: doctorId, title } = doctor;

    // const cacheKey = `doctor:${doctorId}:appointments:${id}`;
    // const cachedData = await redisClient.get(cacheKey);
    // if (cachedData) {
    //   return Response.SUCCESS({ data: JSON.parse(cachedData) });
    // }

    const rawData = await dbObject.getDoctorAppointmentById({
      doctorId,
      appointmentId: id,
    });

    if (!rawData) {
      logger.warn("Appointment not found for appointmentId:", id);
      return Response.NOT_FOUND({ message: "Appointment Not Found" });
    }
    const appointment = mapDoctorAppointmentRow(rawData, title);

    const rawFollowUps = await getAppointmentFollowUps(
      appointment.appointmentId,
    );
    const followUps = rawFollowUps.map(mapFollowUpsRow);

    const mapDoctorAppointment = {
      ...appointment,
      followUps,
    };

    // await redisClient.set({
    //   key: cacheKey,
    //   value: JSON.stringify(mapDoctorAppointment),
    //   expiry: 60,
    // });
    return Response.SUCCESS({ data: mapDoctorAppointment });
  } catch (error) {
    logger.error("getDoctorAppointment: ", error);
    throw error;
  }
};

exports.getDoctorAppointmentByDateRange = async ({
  userId,
  startDate,
  endDate,
  limit,
  page,
}) => {
  try {
    const doctor = await fetchLoggedInDoctor(userId);
    const { doctor_id: doctorId, title } = doctor;

    const offset = (page - 1) * limit;

    const cacheKey = `doctor:${doctorId}:appointments:${startDate}-${endDate}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      const { data, pagination } = JSON.parse(cachedData);
      return Response.SUCCESS({ data, pagination });
    }

    const rawData = await dbObject.getDoctorAppointByDate({
      doctorId,
      startDate,
      endDate,
      limit,
      offset,
    });

    if (!rawData?.length) {
      return Response.SUCCESS({ message: "No appointments found", data: [] });
    }

    const appointments = rawData.map((row) =>
      mapDoctorAppointmentRow(row, title),
    );

    const { totalRows } = rawData[0];

    const paginationInfo = getPaginationInfo({ totalRows, limit, page });

    const valueToCache = {
      data: appointments,
      pagination: paginationInfo,
    };

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(valueToCache),
      expiry: 60,
    });
    return Response.SUCCESS({ data: appointments, pagination: paginationInfo });
  } catch (error) {
    logger.error("getDoctorAppointmentByDateRange: ", error);
    throw error;
  }
};

exports.approveDoctorAppointment = async ({ userId, appointmentId }) => {
  try {
    const doctor = await fetchLoggedInDoctor(userId);

    if (!doctor) {
      return Response.NOT_FOUND({
        message:
          "Doctor Profile Not Found. Please Register As a Doctor and Create a Doctor's Profile",
      });
    }

    const {
      doctor_id: doctorId,
      first_name: doctorFirstName,
      last_name: doctorLastName,
    } = doctor;

    const appointment = await dbObject.getDoctorAppointmentById({
      doctorId,
      appointmentId,
    });

    if (!appointment) {
      return Response.NOT_FOUND({
        message: "Appointment Not Found! Please Try Again!",
      });
    }

    const {
      patient_id: patientId,
      first_name: firstName,
      last_name: lastName,
      patient_name_on_prescription: patientNameOnPrescription,
      appointment_date: appointmentDate,
      appointment_time: appointmentTime,
      appointment_status: appointmentStatus,
      payment_status: paymentStatus,
    } = appointment;

    if (paymentStatus !== "success") {
      logger.warn("Appointment payment unsuccessful: ", paymentStatus);
      return Response.BAD_REQUEST({
        message: "Appointment payment unsuccessful",
      });
    }
    if (["approved", "started"].includes(appointmentStatus)) {
      return Response.SUCCESS({
        message: `Appointment has already been ${appointmentStatus}`,
      });
    }

    const [approveResult, patientResult] = await Promise.allSettled([
      dbObject.approveDoctorAppointmentById({
        doctorId,
        appointmentId,
      }),
      getPatientById(patientId),
    ]);

    if (approveResult.status === "rejected" || !approveResult.value) {
      const reason = approveResult.reason || "Affected rows less than 1";
      logger.error("Failed to approve appointment:", { appointmentId, reason });
      return Response.INTERNAL_SERVER_ERROR({
        message:
          "Something went wrong during appointment approval. Please try again.",
      });
    }

    // Asynchronous operations that don't block the main response
    if (patientResult.status === "fulfilled") {
      const { mobile_number: mobileNumber } = patientResult.value;
      if (mobileNumber) {
        const decryptedPatientName = decryptText(patientNameOnPrescription);
        const patientFirstName = decryptText(firstName);
        const patientLastName = decryptText(lastName);

        const smsData = {
          doctorName: `${doctorFirstName} ${doctorLastName}`,
          patientName: `${patientFirstName} ${patientLastName}`,
          patientNameOnPrescription: decryptedPatientName,
          mobileNumber,
          appointmentDate: moment(appointmentDate).format("YYYY-MM-DD"),
          appointmentTime,
        };
        // Do not await, let it run in the background
        appointmentApprovalSms(smsData).catch((smsError) => {
          logger.error("Failed to send appointment approval SMS:", {
            appointmentId,
            smsError,
          });
        });
      }
    } else {
      logger.warn("Failed to fetch patient data for SMS:", {
        appointmentId,
        reason: patientResult.reason,
      });
    }

    // Clear caches in the background
    const cachePatterns = getAppointmentCacheKeys(doctor.doctor_id, patientId);
    cachePatterns.map((pattern) => redisClient.clearCacheByPattern(pattern));

    return Response.SUCCESS({
      message: "Medical Appointment Approved Successfully",
    });
  } catch (error) {
    logger.error("approveDoctorAppointment: ", error);
    throw error;
  }
};

exports.startDoctorAppointment = async ({ userId, appointmentId }) => {
  try {
    const doctor = await fetchLoggedInDoctor(userId);

    if (!doctor) {
      logger.warn("Doctor profile not found for userId:", userId);
      return Response.NOT_FOUND({
        message:
          "Doctor Profile Not Found. Please Register As a Doctor and Create a Doctor's Profile",
      });
    }
    const { doctor_id: doctorId } = doctor;

    const appointment = await dbObject.getDoctorAppointmentById({
      doctorId,
      appointmentId,
    });
    if (!appointment) {
      logger.warn("Appointment not found:", { appointmentId, doctorId });
      return Response.NOT_FOUND({
        message: "Appointment not found. Please try again.",
      });
    }

    const {
      appointment_uuid: appointmentUUID,
      patient_id: patientId,
      appointment_status: appointmentStatus,
    } = appointment;

    if (appointmentStatus === "started") {
      return Response.SUCCESS({
        message: "Appointment Already Started. Please Join the call",
        data: {
          callID: appointmentUUID,
        },
      });
    }

    const patient = await getPatientById(patientId);
    if (!patient) {
      logger.warn("Patient not found:", { patientId, appointmentId });
      return Response.BAD_REQUEST({
        message: "Patient profile not found. Please try again.",
      });
    }
    const { user_id: patientUserId } = patient;

    const call = {
      callType: nodeEnv === "development" ? "development" : "default",
      callID: appointmentUUID,
      userId,
      members: [
        { role: "host", user_id: userId.toString() },
        { role: "user", user_id: patientUserId.toString() },
      ],
      appointmentId,
    };

    const [streamCallResult, updateResult] = await Promise.all([
      createStreamCall(call),
      dbObject.updateDoctorAppointmentStartTime({
        appointmentId,
        startTime: moment().format("HH:mm:ss"),
      }),
    ]);

    if (!streamCallResult) {
      logger.error("ERROR_STARTING_CALL: ", streamCallResult);
      throw new Error("Unable to start appointment. Please try again later");
    }

    if (!updateResult || updateResult.affectedRows === 0) {
      logger.error("ERROR_UPDATING_CALL_STATUS: ", updateResult);
      throw new Error("Unable to start appointment. Please try again later");
    }

    // Centralized cache clearing
    const cachePatterns = getAppointmentCacheKeys(doctorId, patientId);
    cachePatterns.map((pattern) => redisClient.clearCacheByPattern(pattern));

    return Response.SUCCESS({
      message: "Appointment Started Successfully",
      data: {
        callID: appointmentUUID,
      },
    });
  } catch (error) {
    logger.error("Error starting doctor appointment:", error);
    return Response.INTERNAL_SERVER_ERROR({
      message: "Failed to start appointment. Please try again.",
    });
  }
};

exports.endDoctorAppointment = async ({ userId, appointmentUuid }) => {
  try {
    const doctor = await fetchLoggedInDoctor(userId);
    if (!doctor) {
      logger.error("Doctor profile not found for userId:", userId);
      return Response.UNAUTHORIZED({
        message: "Action can only be performed by a doctor",
      });
    }
    const {
      doctor_id: doctorId,
      first_name: doctorFirstName,
      last_name: doctorLastName,
    } = doctor;

    const appointment = await dbObject.getDoctorAppointmentByUuid({
      doctorId,
      appointmentUuid,
    });

    if (!appointment) {
      logger.warn("Appointment not found for appointmentId:", appointmentUuid);
      return Response.NOT_FOUND({
        message: "Appointment Not Found! Please Try Again!",
      });
    }

    const {
      patient_id: patientId,
      first_name: firstName,
      last_name: lastName,
      appointment_status: appointmentStatus,
      appointment_id: appointmentId,
    } = appointment;

    if (appointmentStatus === "completed") {
      logger.warn("Appointment already completed:", { appointmentUuid });
      return Response.SUCCESS({
        message: "Appointment already completed",
      });
    }

    const patientFirstName = decryptText(firstName);
    const patientLastName = decryptText(lastName);

    const [streamEndResult, dbUpdateResult, patientDataResult] =
      await Promise.allSettled([
        endStreamCall({
          callType: nodeEnv === "development" ? "development" : "default",
          callID: appointmentUuid,
        }),
        dbObject.updateDoctorAppointmentEndTime({
          appointmentId,
          endTime: moment().format("HH:mm:ss"),
        }),
        getPatientById(patientId),
      ]);

    // Check for critical failures first.
    if (streamEndResult.status === "rejected") {
      logger.error("Failed to end video call:", streamEndResult.reason);
      return Response.INTERNAL_SERVER_ERROR({
        message: "Failed to end the video call. Please try again.",
      });
    }

    if (dbUpdateResult.status === "rejected") {
      logger.error(
        "Failed to update appointment end time:",
        dbUpdateResult.reason,
      );
      return Response.INTERNAL_SERVER_ERROR({
        message: "Failed to update appointment record. Please try again.",
      });
    }

    // Handle non-critical operations (SMS and cache) without awaiting them.
    if (
      patientDataResult.status === "fulfilled" &&
      patientDataResult.value.mobile_number
    ) {
      appointmentEndedSms({
        doctorName: `${doctorFirstName} ${doctorLastName}`,
        patientName: `${patientFirstName} ${patientLastName}`,
        mobileNumber: patientDataResult.value.mobile_number,
      }).catch((smsError) => {
        logger.error("Failed to send appointment ended SMS:", smsError);
      });
    }

    const cachePatterns = getAppointmentCacheKeys(doctorId, patientId);
    cachePatterns.map((pattern) => redisClient.clearCacheByPattern(pattern));

    return Response.SUCCESS({
      message: "Appointment Ended Successfully",
    });
  } catch (error) {
    logger.error("Error ending doctor appointment:", error);
    return Response.INTERNAL_SERVER_ERROR({
      message: "Failed to end appointment due to an unexpected error.",
    });
  }
};

exports.cancelDoctorAppointment = async ({
  userId,
  appointmentId,
  cancelReason,
}) => {
  try {
    const doctor = await fetchLoggedInDoctor(userId);

    if (!doctor) {
      logger.error(`Doctor profile not found for userId: ${userId}`);
      return Response.NOT_FOUND({
        message:
          "Doctor Profile Not Found. Please Register As a Doctor and Create a Doctor's Profile",
      });
    }
    const {
      is_profile_approved: isProfileApproved,
      doctor_id: doctorId,
      mobile_number: mobileNumber,
    } = doctor;

    if (isProfileApproved !== VERIFICATIONSTATUS.VERIFIED) {
      logger.error("Doctor's profile not approved for userId:", userId);
      return Response.UNAUTHORIZED({
        message:
          "Doctor's Profile has not been approved by admin. Please contact admin for profile approval and try again",
      });
    }

    //  Check if the appointment exist
    const rawData = await dbObject.getDoctorAppointmentById({
      doctorId,
      appointmentId,
    });
    if (!rawData) {
      logger.warn("Appointment not found for appointmentId:", appointmentId);
      return Response.NOT_FOUND({ message: "Appointment Not Found" });
    }

    // Extract patient id from appointment to get patient email
    const {
      appointment_status: appointmentStatus,
      appointment_date: appointmentDate,
      appointment_time: appointmentTime,
      patient_name_on_prescription: patientNameOnPrescription,
      doctor_last_name: doctorLastName,
      patient_id: patientId,
    } = rawData;

    const decryptedPatientName = decryptText(patientNameOnPrescription);

    const now = moment();
    const appointmentDateTime = moment(
      `${appointmentDate} ${appointmentTime}`,
      "YYYY-MM-DD HH:mm:ss",
    );

    // check if appointment date is past
    if (appointmentDateTime.isBefore(now)) {
      return Response.BAD_REQUEST({
        message: "You cannot cancel a past appointment",
      });
    }

    const hoursDiff = appointmentDateTime.diff(now, "hours");

    if (hoursDiff < 24) {
      logger.warn(`Appointment too close to cancel: ${hoursDiff}h remaining`);
      return Response.BAD_REQUEST({
        message:
          "Appointments can only be cancelled at least 24 hours in advance",
      });
    }

    if (appointmentStatus === "canceled") {
      return Response.NOT_MODIFIED();
    }

    // UPDATE appointment status to 'approved'
    const { affectedRows } = await dbObject.cancelDoctorAppointmentById({
      doctorId,
      appointmentId,
      cancelReason,
    });

    if (!affectedRows || affectedRows < 1) {
      logger.error(
        "Failed to cancel appointment for appointmentId:",
        appointmentId,
      );
      return Response.BAD_REQUEST({
        message: "Failed to cancel appointment. Please try again later.",
      });
    }

    await doctorAppointmentCancelledSms({
      mobileNumber,
      doctorName: `Dr. ${doctorLastName}`,
      patientNameOnPrescription: decryptedPatientName,
      appointmentDate,
      appointmentTime,
      cancelReason,
    });

    // Centralized cache clearing
    const cachePatterns = getAppointmentCacheKeys(doctorId, patientId);
    await Promise.all(
      cachePatterns.map((pattern) => redisClient.clearCacheByPattern(pattern)),
    );

    return Response.SUCCESS({
      message:
        "Appointment Canceled Successfully. An email has been sent to the patient",
    });
  } catch (error) {
    logger.error("cancelDoctorAppointment: ", error);
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
    const doctor = await fetchLoggedInDoctor(userId);

    if (!doctor) {
      logger.error("Doctor profile not found for userId:", userId);
      return Response.NOT_FOUND({
        message:
          "Doctor Profile Not Found. Please Register As a Doctor and Create a Doctor's Profile",
      });
    }
    const { doctor_id: doctorId } = doctor;

    const [rawData, timeSlotBooked, availabilityCheck] = await Promise.all([
      dbObject.getDoctorAppointmentById({ doctorId, appointmentId }),
      dbObject.getDoctorAppointByDateAndTime({
        doctorId,
        date: postponedDate,
        time: postponedTime,
      }),
      checkDoctorAvailability(doctorId, `${postponedDate} ${postponedTime}`),
    ]);

    if (!rawData) {
      logger.warn("Appointment not found:", { appointmentId });
      return Response.NOT_FOUND({ message: "Appointment Not Found" });
    }

    if (timeSlotBooked) {
      logger.warn("Time slot already booked:", {
        postponedDate,
        postponedTime,
      });
      return Response.BAD_REQUEST({
        message:
          "An appointment has already been booked for this time. Please choose another.",
      });
    }

    if (!availabilityCheck.isAvailable) {
      logger.warn("Doctor not available for proposed time:", {
        reason: availabilityCheck.message,
        errorCode: availabilityCheck.reasonCode,
      });
      return Response.CONFLICT({
        message: availabilityCheck.message,
        errorCode: availabilityCheck.reasonCode,
      });
    }

    const {
      patient_id: patientId,
      patient_name_on_prescription: patientNameOnPrescription,
      first_name: patientFirstName,
      last_name: patientLastName,
      doctor_first_name: doctorFirstName,
      doctor_last_name: doctorLastName,
    } = rawData;

    const updateResult = await dbObject.postponeDoctorAppointmentById({
      doctorId,
      appointmentId,
      postponedReason,
      postponedDate,
      postponedTime,
    });

    if (updateResult.affectedRows < 1) {
      logger.error("Failed to postpone appointment:", {
        appointmentId,
        updateResult,
      });
      return Response.INTERNAL_SERVER_ERROR({
        message: "Failed to postpone appointment. Please try again later.",
      });
    }

    // Non-critical operations (SMS, cache clearing) run in the background.
    const patient = await getPatientById(patientId);

    if (patient) {
      const { mobile_number: mobileNumber } = patient;
      const decryptedPatientName = decryptText(patientNameOnPrescription);
      const decryptedPatientFirstName = decryptText(patientFirstName);
      const decryptedPatientLastName = decryptText(patientLastName);

      await appointmentPostponedSms({
        patientName: `${decryptedPatientFirstName} ${decryptedPatientLastName}`,
        patientNameOnPrescription: decryptedPatientName,
        mobileNumber,
        doctorName: `${doctorFirstName} ${doctorLastName}`,
        appointmentDate: postponedDate,
        appointmentTime: postponedTime,
      }).catch((smsError) => {
        logger.error("Failed to send appointment postponed SMS:", {
          appointmentId,
          smsError,
        });
      });
    }

    const cachePatterns = getAppointmentCacheKeys(doctorId, patientId);
    cachePatterns.map((pattern) => redisClient.clearCacheByPattern(pattern));

    return Response.SUCCESS({
      message:
        "Appointment postponed successfully and user has been notified. Please ensure to complete appointment on the rescheduled date.",
    });
  } catch (error) {
    logger.error("postponeDoctorAppointment: ", error);
    throw error;
  }
};
