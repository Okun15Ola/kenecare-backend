const {
  getAppointmentPrescriptions,
  createAppointmentPrescriptions,
  updateAppointmentPrescriptions,
  getAppointmentPrescriptionById,
} = require("../repository/prescriptions.repository");
const Response = require("../utils/response.utils");
const {
  generateVerificationToken,
  hashUsersPassword,
  encryptText,
} = require("../utils/auth.utils");
const { sendPrescriptionToken } = require("../utils/sms.utils");
const {
  getAppointmentByID,
} = require("../repository/patientAppointments.repository");
const { getPatientById } = require("../repository/patients.repository");
const redisClient = require("../config/redis.config");
const { cacheKeyBulider } = require("../utils/caching.utils");
const { mapPrescriptionRow } = require("../utils/db-mapper.utils");

exports.getAppointmentPrescriptions = async (
  id,
  limit,
  offset,
  paginationInfo,
) => {
  try {
    const cacheKey = cacheKeyBulider(
      "appointment-prescriptions:all",
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
    const rawData = await getAppointmentPrescriptions(limit, offset, id);

    if (!rawData?.length) {
      return Response.NOT_FOUND({ message: "Presciption Not Found" });
    }

    const prescriptions = rawData.map(mapPrescriptionRow);

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(prescriptions),
    });
    return Response.SUCCESS({
      data: prescriptions,
      pagination: paginationInfo,
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.getAppointmentPrescriptionById = async (id) => {
  try {
    const cacheKey = `appointment-prescriptions:${id}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }
    const prescriptionExist = await getAppointmentPrescriptionById(id);

    if (!prescriptionExist) {
      return Response.NOT_FOUND({
        message: "Prescription Not Found. Try again",
      });
    }
    const { access_jwt: hashedToken } = prescriptionExist;

    // //TODO Check accesstoken
    // const isTokenMatch = await comparePassword({
    //   plainPassword: accessToken,
    //   hashedPassword: hashedToken,
    // });

    const prescription = mapPrescriptionRow(
      prescriptionExist,
      hashedToken,
      true,
      true,
      true,
    );
    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(prescription),
    });

    return Response.SUCCESS({ data: prescription });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.createPrescription = async ({
  appointmentId,
  diagnosis,
  medicines,
  comment,
}) => {
  try {
    const stringifiedMedicines = JSON.stringify(medicines);

    const appointment = await getAppointmentByID(appointmentId);

    if (!appointment) {
      return Response.NOT_FOUND({
        message: "Appointment Not Found! Please Try again",
      });
    }

    const { patient_id: patientId, doctor_last_name: doctorName } = appointment;

    const { mobile_number: mobileNumber } = await getPatientById(patientId);

    // Generate Prescription Access Token
    const accessToken = generateVerificationToken();

    // Hash Generated Access Token
    const hashedToken = await hashUsersPassword(accessToken);

    // Use Hashed Token to encyrpt presctiption
    const encDiagnosis = encryptText(diagnosis, hashedToken);
    const encMedicines = encryptText(stringifiedMedicines, hashedToken);
    const encComment = encryptText(comment, hashedToken);

    // Save encrypted prescription with access token in database
    await createAppointmentPrescriptions({
      appointmentId,
      diagnosis: encDiagnosis,
      medicines: encMedicines,
      comment: encComment,
      accessToken: hashedToken,
    });

    // send access token to user for later use
    await sendPrescriptionToken({
      mobileNumber,
      doctorName,
    });

    return Response.CREATED({
      message: "Prescription Created Successfully",
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.updatePrescriptions = async ({
  appointmentId,
  prescriptionId,
  diagnosis,
  medicines,
  comment,
}) => {
  try {
    const stringifiedMedicines = JSON.stringify(medicines);

    await updateAppointmentPrescriptions({
      appointmentId,
      prescriptionId,
      diagnosis,
      medicines: stringifiedMedicines,
      comment,
    });
    return Response.CREATED({
      message: "Prescription Updated Successfully",
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
