const moment = require("moment");
const {
  getAppointmentPrescriptions,
  getAppointmentPrescriptionById,
} = require("../../repository/prescriptions.repository");
const Response = require("../../utils/response.utils");
const { decryptText } = require("../../utils/auth.utils");
const redisClient = require("../../config/redis.config");

exports.getAppointmentPrescriptions = async (id) => {
  try {
    const cacheKey = "patient-prescriptions:all";
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }
    const rawData = await getAppointmentPrescriptions(id);

    const prescriptions = rawData.map(
      ({
        prescription_id: prescriptionId,
        appointment_id: appointmentId,
        created_at: dateCreated,
        updated_at: dateUpdated,
        access_jwt: hashedToken,
        diagnosis,
        medicines,
        doctors_comment: doctorComment,
      }) => {
        const decryptedDiagnosis = decryptText({
          encryptedText: diagnosis,
          key: hashedToken,
        });
        const decryptedMedicines = decryptText({
          encryptedText: medicines,
          key: hashedToken,
        });
        const decryptedComment = decryptText({
          encryptedText: doctorComment,
          key: hashedToken,
        });

        return {
          prescriptionId,
          appointmentId,
          diagnosis: decryptedDiagnosis,
          medicines: JSON.parse(decryptedMedicines),
          comment: decryptedComment,
          createdAt: moment(dateCreated).format("YYYY-MM-DD"),
          updatedAt: moment(dateUpdated).format("YYYY-MM-DD"),
        };
      },
    );

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(prescriptions),
    });

    return Response.SUCCESS({ data: prescriptions });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.getAppointmentPrescriptionById = async (presId) => {
  try {
    const cacheKey = `patient-prescriptions:${presId}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }
    const rawData = await getAppointmentPrescriptionById(presId);

    if (!rawData) {
      return Response.NOT_FOUND({
        message: "Prescription Not Found. Try again",
      });
    }
    const { access_jwt: hashedToken } = rawData;

    const {
      prescription_id: prescriptionId,
      appointment_id: appointmentId,
      diagnosis,
      medicines,
      doctors_comment: doctorComment,
      created_at: dateCreated,
      updated_at: dateUpdated,
    } = rawData;

    const decryptedDiagnosis = decryptText({
      encryptedText: diagnosis,
      key: hashedToken,
    });
    const decryptedMedicines = decryptText({
      encryptedText: medicines,
      key: hashedToken,
    });
    const decryptedComment = decryptText({
      encryptedText: doctorComment,
      key: hashedToken,
    });

    const prescription = {
      prescriptionId,
      appointmentId,
      diagnosis: decryptedDiagnosis,
      medicines: JSON.parse(decryptedMedicines),
      comment: decryptedComment,
      createdAt: moment(dateCreated).format("YYYY-MM-DD"),
      updatedAt: moment(dateUpdated).format("YYYY-MM-DD"),
    };

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
