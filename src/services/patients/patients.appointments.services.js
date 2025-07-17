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
const { redisClient } = require("../../config/redis.config");
const {
  mapPatientAppointment,
  mapFollowUpsRow,
} = require("../../utils/db-mapper.utils");
const { cacheKeyBulider } = require("../../utils/caching.utils");

exports.getPatientAppointments = async (
  userId,
  limit,
  offset,
  paginationInfo,
) => {
  try {
    const patient = await getPatientByUserId(userId);

    if (!patient) {
      logger.warn(`Patient Profile Not Found for user ${userId}`);
      return Response.NOT_FOUND({
        message:
          "Patient profile not found please, create profile before proceeding",
      });
    }
    const { patient_id: patientId } = patient;
    const cacheKey = cacheKeyBulider(
      `patient-appointments-${patientId}:all`,
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
    const rawData = await repo.getAllPatientAppointments({
      patientId,
      offset,
      limit,
    });

    if (!rawData?.length) {
      return Response.SUCCESS({
        message: "No patient appointments found",
        data: [],
      });
    }

    const appointments = rawData.map(mapPatientAppointment);

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(appointments),
    });

    return Response.SUCCESS({ data: appointments, pagination: paginationInfo });
  } catch (error) {
    logger.error("getPatientAppointments: ", error);
    throw error;
  }
};

exports.getPatientAppointment = async ({ userId, id }) => {
  try {
    const patient = await getPatientByUserId(userId);

    if (!patient) {
      logger.warn(`Patient Profile Not Found for user ${userId}`);
      return Response.NOT_FOUND({
        message:
          "Patient profile not found please, create profile before proceeding",
      });
    }
    const { patient_id: patientId } = patient;
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
      logger.warn(`Appointment Not Found for ID ${id}`);
      return Response.NOT_FOUND({ message: "Appointment Not Found" });
    }
    const appointment = mapPatientAppointment(rawData);

    const rawFollowUps = await getAppointmentFollowUps(
      appointment.appointmentId,
    );
    const followUps = rawFollowUps.map(mapFollowUpsRow) || null;

    const appointmentWithFollowUp = {
      ...appointment,
      followUps,
    };

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(appointmentWithFollowUp),
    });

    return Response.SUCCESS({ data: appointmentWithFollowUp });
  } catch (error) {
    logger.error("getPatientAppointment: ", error);
    throw error;
  }
};

exports.getPatientAppointmentByUUID = async ({ userId, uuId }) => {
  try {
    const patient = await getPatientByUserId(userId);

    if (!patient) {
      logger.warn(`Patient Profile Not Found for user ${userId}`);
      return Response.NOT_FOUND({
        message:
          "Patient profile not found please, create profile before proceeding",
      });
    }

    const { patient_id: patientId } = patient;
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
      logger.warn(`Appointment Not Found for UUID ${uuId}`);
      return Response.NOT_FOUND({ message: "Appointment Not Found" });
    }

    const appointment = mapPatientAppointment(rawData);

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(appointment),
    });
    return Response.SUCCESS({ data: appointment });
  } catch (error) {
    logger.error("getPatientAppointmentByUUID: ", error);
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
  let appointmentId = null;
  try {
    // Parallel validation - Get patient, doctor, and check availability
    const [patient, doctor, timeBooked] = await Promise.allSettled([
      getPatientByUserId(userId),
      getDoctorById(doctorId),
      getDoctorAppointByDateAndTime({
        doctorId,
        date: appointmentDate,
        time: appointmentTime,
      }),
    ]);

    //  validate patient
    if (patient.status === "rejected" || !patient.value) {
      logger.warn(`Patient Profile Not Found for user ${userId}`);
      return Response.BAD_REQUEST({
        message:
          "Please create a patient profile before booking an appointment",
      });
    }

    // validate doctor
    if (doctor.status === "rejected" || !doctor.value) {
      logger.warn(`Doctor Not Found for ID ${doctorId}`);
      return Response.BAD_REQUEST({
        message: "Specified Doctor does not exist. Please try again",
      });
    }

    if (timeBooked.status === "fulfilled" && timeBooked.value) {
      logger.warn(
        `Appointment already booked for Doctor ${doctorId} on ${appointmentDate} at ${appointmentTime}`,
      );
      return Response.BAD_REQUEST({
        message:
          "An appointment has already been booked for the specified time. Please choose a new appointment time",
      });
    }

    const {
      patient_id: patientId,
      first_name: userFirstName,
      last_name: userLastName,
      booked_first_appointment: hasBookedFirstAppointment,
      mobile_number: mobileNumber,
    } = patient.value;

    const {
      consultation_fee: consultationFee,
      first_name: doctorFirstName,
      last_name: doctorLastName,
      mobile_number: doctorMobileNumber,
    } = doctor.value;

    const generatedOrderId = uuidv4();

    const appointmentResult = await repo.createNewPatientAppointment({
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

    appointmentId = appointmentResult.insertId;

    if (!appointmentId) {
      logger.error("Failed to create new patient appointment");
      return Response.INTERNAL_SERVER_ERROR({
        message: "An Error Occured on our side, please try again",
      });
    }

    if (!hasBookedFirstAppointment) {
      const [
        appointmentResult,
        updateAppointmentResult,
        appointmentSms,
        doctorAppointmentSms,
      ] = await Promise.allSettled([
        createFirstAppointmentPayment({
          appointmentId,
          amountPaid: consultationFee,
          orderId: generatedOrderId,
          paymentMethod: "FIRST_FREE_APPOINTMENT",
          transactionId: "FIRST_FREE_APPOINTMENT",
          paymentToken: "FIRST_FREE_APPOINTMENT",
          notificationToken: "FIRST_FREE_APPOINTMENT",
          status: "success",
        }),
        updatePatientFirstAppointmentStatus(patientId),
        appointmentBookedSms({
          mobileNumber,
          patientName: `${userFirstName} ${userLastName}`,
          doctorName: `${doctorFirstName} ${doctorLastName}`,
          patientNameOnPrescription: patientName,
          appointmentDate: moment(appointmentDate).format("YYYY-MM-DD"),
          appointmentTime,
        }),
        doctorAppointmentBookedSms({
          mobileNumber: doctorMobileNumber,
          doctorName: `${doctorLastName}`,
          patientNameOnPrescription: patientName,
          appointmentDate: moment(appointmentDate).format("YYYY-MM-DD"),
          appointmentTime,
        }),
      ]);

      if (
        appointmentResult.status === "rejected" ||
        updateAppointmentResult.status === "rejected" ||
        appointmentSms.status === "rejected" ||
        doctorAppointmentSms.status === "rejected"
      ) {
        logger.error(
          `Error processing first appointment booking for appointment ID ${appointmentId}: `,
          appointmentResult.reason ||
            updateAppointmentResult.reason ||
            appointmentSms.reason ||
            doctorAppointmentSms.reason,
        );
        await repo.deleteAppointmentById({ appointmentId });
        return Response.INTERNAL_SERVER_ERROR({
          message: "An Error Occured on our side, please try again",
        });
      }

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
      logger.error(
        `Error getting payment URL for appointment ID ${appointmentId}: `,
        error,
      );
      throw error;
    });

    if (!response) {
      logger.error(
        `Failed to get payment URL for appointment ID ${appointmentId}`,
      );
      await repo.deleteAppointmentById({ appointmentId });
      return Response.INTERNAL_SERVER_ERROR({
        message: "An Error Occured on our side, please try again",
      });
    }

    const { ussdCode, paymentCodeId, idempotencyKey, expiresAt, cancelUrl } =
      response;

    // create new appointment payments record
    const { insertId } = await createAppointmentPayment({
      appointmentId,
      amountPaid: consultationFee,
      orderId: generatedOrderId,
      paymentMethod: "",
      paymentToken: ussdCode,
      notificationToken: idempotencyKey,
      transactionId: paymentCodeId,
    });

    if (!insertId) {
      logger.error(
        `Failed to create appointment payment record for appointment ID ${appointmentId}`,
      );
      await repo.deleteAppointmentById({ appointmentId });
      return Response.INTERNAL_SERVER_ERROR({
        message: "An Error Occured on our side, please try again",
      });
    }

    return Response.CREATED({
      message: "Appointment Booked Successfully. Proceed to payment.",
      data: {
        paymentUrl: ussdCode,
        cancelUrl,
        paymentUrlExpiresAt: expiresAt,
      },
    });
  } catch (error) {
    logger.error("createPatientAppointment", error);
    throw error;
  }
};
