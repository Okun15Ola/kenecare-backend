const moment = require("moment");
const dbObject = require("../../repository/doctorAppointments.repository");
const { getDoctorByUserId } = require("../../repository/doctors.repository");
const { getUserById } = require("../../repository/users.repository");
const { USERTYPE, VERIFICATIONSTATUS } = require("../../utils/enum.utils");
const Response = require("../../utils/response.utils");
const { getPatientById } = require("../../repository/patients.repository");
const {
  appointmentApprovalSms,
  appointmentPostponedSms,
  appointmentEndedSms,
} = require("../../utils/sms.utils");
const logger = require("../../middlewares/logger.middleware");
const {
  getAppointmentFollowUps,
} = require("../../repository/follow-up.repository");
const { createStreamCall } = require("../../utils/stream.utils");
const { nodeEnv } = require("../../config/default.config");
const { redisClient } = require("../../config/redis.config");
const {
  mapDoctorAppointmentRow,
  mapFollowUpsRow,
} = require("../../utils/db-mapper.utils");
const {
  cacheKeyBulider,
  getCachedCount,
  getPaginationInfo,
} = require("../../utils/caching.utils");

exports.getDoctorAppointmentMetrics = async (userId) => {
  try {
    const { doctor_id: doctorId } = await getDoctorByUserId(userId);

    if (!doctorId) {
      logger.warn(`Doctor Profile Not Found for user ${userId}`);
      return Response.NOT_FOUND({
        message:
          "Doctor profile not found please, create profile before proceeding",
      });
    }

    const cacheKey = `doctor:${doctorId}:appointment-metrics`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }

    const data = await dbObject.getDoctorAppointmentsDashboardCount({
      doctorId,
    });

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(data),
    });

    return Response.SUCCESS({ data });
  } catch (error) {
    logger.error("getDoctorAppointmentCounts: ", error);
    throw error;
  }
};

exports.getDoctorAppointments = async ({ userId, limit, page }) => {
  try {
    const doctor = await getDoctorByUserId(userId);

    if (!doctor) {
      logger.error("Doctor profile not found for userId:", userId);
      return Response.NOT_FOUND({
        message:
          "Doctor Profile Not Found. Please Register As a Doctor and Create a Doctor's Profile",
      });
    }

    const { doctor_id: doctorId, title } = doctor;

    const offset = (page - 1) * limit;
    const countCacheKey = `doctors:appointments-${doctorId}:count`;
    const totalRows = await getCachedCount({
      cacheKey: countCacheKey,
      countQueryFn: () => dbObject.countDoctorAppointments({ doctorId }),
    });

    if (!totalRows) {
      return Response.SUCCESS({ message: "No appointments found", data: [] });
    }

    const paginationInfo = getPaginationInfo({ totalRows, limit, page });

    const cacheKey = cacheKeyBulider(
      `doctors:appointments-${doctorId}:all`,
      limit,
      offset,
    );
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({
        data: JSON.parse(cachedData),
        pagination: paginationInfo,
      });
    }

    // Get doctor's appointments
    const rawData = await dbObject.getAppointmentsByDoctorId({
      doctorId,
      limit,
      offset,
    });

    if (!rawData?.length) {
      return Response.SUCCESS({ message: "No appointments found", data: [] });
    }

    const appointments = rawData.map((row) =>
      mapDoctorAppointmentRow(row, title),
    );

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(appointments),
    });
    return Response.SUCCESS({ data: appointments, pagination: paginationInfo });
  } catch (error) {
    logger.error("getDoctorAppointments: ", error);
    throw error;
  }
};

exports.getDoctorAppointment = async ({ userId, id }) => {
  try {
    const doctor = await getDoctorByUserId(userId);
    if (!doctor) {
      logger.error("Doctor profile not found for userId:", userId);
      return Response.NOT_FOUND({
        message:
          "Doctor Profile Not Found. Please Register As a Doctor and Create a Doctor's Profile",
      });
    }

    const { user_type: userType, doctor_id: doctorId, title } = doctor;

    if (userType !== USERTYPE.DOCTOR) {
      logger.error("Unauthorized access attempt by userId:", userId);
      return Response.UNAUTHORIZED({ message: "Unauthorized access" });
    }

    const cacheKey = `doctor:appointments-${doctorId}:${id}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }

    const rawData = await dbObject.getDoctorAppointmentById({
      appointmentId: id,
      doctorId,
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

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(mapDoctorAppointment),
    });
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
    const doctor = await getDoctorByUserId(userId);
    const { doctor_id: doctorId, title } = doctor;

    const offset = (page - 1) * limit;
    const countCacheKey = `doctor:${doctorId}:appointments-${startDate}-${endDate}:count`;
    const totalRows = await getCachedCount({
      cacheKey: countCacheKey,
      countQueryFn: () =>
        dbObject.countDoctorAppointmentsByDate({
          doctorId,
          startDate,
          endDate,
        }),
    });

    if (!totalRows) {
      return Response.SUCCESS({ message: "No appointments found", data: [] });
    }

    const paginationInfo = getPaginationInfo({ totalRows, limit, page });
    const cacheKey = `doctors:${doctorId}:appointments:${startDate}-${endDate}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({
        data: JSON.parse(cachedData),
        pagination: paginationInfo,
      });
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

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(appointments),
    });
    return Response.SUCCESS({ data: appointments, pagination: paginationInfo });
  } catch (error) {
    logger.error("getDoctorAppointmentByDateRange: ", error);
    throw error;
  }
};

exports.approveDoctorAppointment = async ({ userId, appointmentId }) => {
  try {
    const doctor = await getDoctorByUserId(userId);

    if (!doctor) {
      logger.error("Doctor profile not found for userId:", userId);
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
      logger.warn("Appointment not found for appointmentId:", appointmentId);
      return Response.NOT_FOUND({
        message: "Appointment Not Found! Please Try Again!",
      });
    }

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

    if (appointmentStatus === "approved") {
      logger.warn(
        "Appointment already approved for appointmentId:",
        appointmentId,
      );
      return Response.SUCCESS({
        message: "Appointment has already been approved",
      });
    }
    if (appointmentStatus === "started") {
      logger.warn(
        "Appointment already started for appointmentId:",
        appointmentId,
      );
      return Response.SUCCESS({
        message: "Appointment meeting has already started",
      });
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
    logger.error("approveDoctorAppointment: ", error);
    throw error;
  }
};

exports.startDoctorAppointment = async ({ userId, appointmentId }) => {
  try {
    const doctor = await getDoctorByUserId(userId);

    if (!doctor) {
      logger.error("Doctor profile not found for userId:", userId);
      return Response.BAD_REQUEST({
        message: "Error Starting Appointment, please try again",
      });
    }
    const {
      doctor_id: doctorId,
      // first_name: doctorFirstName,
      // last_name: doctorLastName,
    } = doctor;
    // Get doctor's appointment by ID
    const appointment = await dbObject.getDoctorAppointmentById({
      doctorId,
      appointmentId,
    });

    if (!appointment) {
      logger.error("Appointment not found for appointmentId:", appointmentId);
      return Response.BAD_REQUEST({
        message: "Error Starting Appointment, please try again",
      });
    }

    // Extract patient id from appointment to get patient email
    const { appointment_uuid: appointmentUUID, patient_id: patientId } =
      appointment;

    const ptnt = await getPatientById(patientId);
    if (!ptnt) {
      logger.error("Patient not found for patientId:", patientId);
      return Response.BAD_REQUEST({
        message: "Error Starting Appointment, please try again",
      });
    }

    const { user_id: patientUserId } = ptnt;
    // if (appointmentStatus === "started") {
    //   return Response.NOT_MODIFIED();
    // }

    const call = {
      callType: nodeEnv === "development" ? "development" : "default",
      callID: appointmentUUID,
      userId,
      members: [
        { user_id: userId.toString() },
        { user_id: patientUserId.toString() },
      ],
      appointmentId,
    };

    await createStreamCall(call);

    await Promise.allSettled([
      getPatientById(patientId),
      dbObject.updateDoctorAppointmentStartTime({
        appointmentId,
        startTime: moment().format("HH:mm:ss"),
      }),
    ]);

    return Response.SUCCESS({
      message: "Appointment Started Successfully",
      data: {
        callID: appointmentUUID,
      },
    });
  } catch (error) {
    logger.error("startDoctorAppointment: ", error);
    throw error;
  }
};

exports.endDoctorAppointment = async ({ userId, appointmentId }) => {
  try {
    const doctor = await getDoctorByUserId(userId);
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
    // Get doctor's appointment by ID
    const appointment = await dbObject.getDoctorAppointmentById({
      doctorId,
      appointmentId,
    });

    // Check if the appointment exists
    if (!appointment) {
      logger.warn("Appointment not found for appointmentId:", appointmentId);
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
      logger.warn(
        "Appointment already completed for appointmentId:",
        appointmentId,
      );
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
    logger.error("endDoctorAppointment: ", error);
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
      logger.error("User not found for userId:", userId);
      return Response.NOT_FOUND({ message: "User Not Found" });
    }

    const { user_type: userType } = user;

    if (userType !== USERTYPE.DOCTOR) {
      logger.error("Unauthorized access attempt by userId:", userId);
      return Response.UNAUTHORIZED({ message: "Unauthorized access" });
    }

    const doctor = await getDoctorByUserId(userId);

    if (!doctor) {
      logger.error("Doctor profile not found for userId:", userId);
      return Response.NOT_FOUND({
        message:
          "Doctor Profile Not Found. Please Register As a Doctor and Create a Doctor's Profile",
      });
    }
    const { is_profile_approved: isProfileApproved, doctor_id: doctorId } =
      doctor;

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
    const { appointment_status: appointmentStatus } = rawData;

    // patient_id: patientId,
    // console.log(patientId);
    if (appointmentStatus === "canceled") {
      logger.warn(
        "Appointment already canceled for appointmentId:",
        appointmentId,
      );
      return Response.NOT_MODIFIED();
    }

    // TODO Check the appointment date and time
    // TODO Appointment's can only be cancelled 24 hours before the appointment date

    // UPDATE appointment status to 'approved'
    const { affectedRows } = await dbObject.cancelDoctorAppointmentById({
      appointmentId,
      doctorId,
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

    // TODO Send a notification(email,sms) to the user

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
    const user = await getUserById(userId);

    if (!user) {
      logger.error("User not found for userId:", userId);
      return Response.NOT_FOUND({ message: "User Not Found" });
    }

    const { user_type: userType } = user;

    if (userType !== USERTYPE.DOCTOR) {
      logger.error("Unauthorized access attempt by userId:", userId);
      return Response.UNAUTHORIZED({ message: "Unauthorized access" });
    }

    const doctor = await getDoctorByUserId(userId);

    if (!doctor) {
      logger.error("Doctor profile not found for userId:", userId);
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
      logger.warn("Appointment not found for appointmentId:", appointmentId);
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
      logger.warn(
        "Appointment already postponed for appointmentId:",
        appointmentId,
      );
      return Response.NOT_MODIFIED();
    }

    // check if the date and time has already been booked
    const timeSlotBooked = await dbObject.getDoctorAppointByDateAndTime({
      doctorId,
      date: postponedDate,
      time: postponedTime,
    });

    if (timeSlotBooked) {
      logger.warn(
        "Time slot already booked for date:",
        postponedDate,
        "and time:",
        postponedTime,
      );
      return Response.BAD_REQUEST({
        message:
          "An appointment has already been booked for the specified time on that date. Please choose another time.",
      });
    }
    const { mobile_number: mobileNumber } = await getPatientById(patientId);
    // UPDATE appointment status to 'approved'
    const { affectedRows } = await dbObject.postponeDoctorAppointmentById({
      postponedReason,
      postponedDate,
      postponedTime,
      appointmentId,
      doctorId,
    });

    if (!affectedRows || affectedRows < 1) {
      logger.error(
        "Failed to postpone appointment for appointmentId:",
        appointmentId,
      );
      return Response.BAD_REQUEST({
        message: "Failed to postpone appointment. Please try again later.",
      });
    }

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
    logger.error("postponeDoctorAppointment: ", error);
    throw error;
  }
};
