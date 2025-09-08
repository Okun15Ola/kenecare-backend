const {
  getAppointmentPrescriptions,
  createAppointmentPrescriptions,
  updateAppointmentPrescriptions,
  getAppointmentPrescriptionById,
  verifyDoctorPrescription,
} = require("../repository/prescriptions.repository");
const Response = require("../utils/response.utils");
const { redisClient } = require("../config/redis.config");
const { mapPrescriptionRow } = require("../utils/db-mapper.utils");
const logger = require("../middlewares/logger.middleware");
const { encryptText } = require("../utils/auth.utils");
const { mapDoctorPrescriptionRow } = require("../utils/db-mapper.utils");

exports.getAppointmentPrescriptions = async (id) => {
  try {
    const cacheKey = `appointment:${id}:prescriptions`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({
        data: JSON.parse(cachedData),
      });
    }
    const rawData = await getAppointmentPrescriptions(id);

    if (!rawData) {
      return Response.NOT_FOUND({
        message: "Prescription Not Found.",
      });
    }

    const prescription = mapPrescriptionRow(rawData, true, true, true);

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(prescription),
    });
    return Response.SUCCESS({
      data: prescription,
    });
  } catch (error) {
    logger.error("getAppointmentPrescriptions: ", error);
    throw error;
  }
};

exports.getAppointmentPrescriptionById = async (id) => {
  try {
    const cacheKey = `prescriptions:${id}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }
    const prescriptionExist = await getAppointmentPrescriptionById(id);

    if (!prescriptionExist) {
      logger.warn(`Prescription not found for ID ${id}`);
      return Response.NOT_FOUND({
        message: "Prescription not found. Try again",
      });
    }

    const prescription = mapPrescriptionRow(
      prescriptionExist,
      true,
      true,
      true,
    );
    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(prescription),
      expiry: 60,
    });

    return Response.SUCCESS({ data: prescription });
  } catch (error) {
    logger.error("getAppointmentPrescriptionById: ", error);
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
    // encyrpt patient prescription
    const encDiagnosis = encryptText(diagnosis);
    const encMedicines = encryptText(stringifiedMedicines);
    const encComment = encryptText(comment);

    // Save encrypted prescription with access token in database
    const { insertId } = await createAppointmentPrescriptions({
      appointmentId,
      diagnosis: encDiagnosis,
      medicines: encMedicines,
      comment: encComment,
    });

    if (!insertId) {
      logger.warn(
        `Failed to create prescription for Appointment ID ${appointmentId}`,
      );
      return Response.INTERNAL_SERVER_ERROR({
        message: "Something Went Wrong. Please Try Again.",
      });
    }

    await redisClient.delete(`appointment:${appointmentId}:prescriptions`);

    return Response.CREATED({
      message: "Prescription Created Successfully",
    });
  } catch (error) {
    logger.error("createPrescription: ", error);
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

    const encDiagnosis = encryptText(diagnosis);
    const encMedicines = encryptText(stringifiedMedicines);
    const encComment = encryptText(comment);

    const { affectedRows } = await updateAppointmentPrescriptions({
      appointmentId,
      prescriptionId,
      diagnosis: encDiagnosis,
      medicines: encMedicines,
      comment: encComment,
    });

    if (!affectedRows || affectedRows < 1) {
      logger.warn(
        `Failed to update prescription for Appointment ID ${appointmentId}`,
      );
      return Response.NOT_MODIFIED({});
    }

    await redisClient.delete(`appointment:${appointmentId}:prescriptions`);

    return Response.SUCCESS({
      message: "Prescription Updated Successfully",
    });
  } catch (error) {
    logger.error("updatePrescriptions: ", error);
    throw error;
  }
};

exports.verifyDoctorPrescriptionService = async (doctorId, prescriptionId) => {
  try {
    const prescription = await verifyDoctorPrescription(
      doctorId,
      prescriptionId,
    );

    if (!prescription) {
      return Response.NOT_FOUND({
        message:
          "Prescription not found or you do not have permission to view it.",
      });
    }

    const data = await mapDoctorPrescriptionRow(prescription);

    return Response.SUCCESS({
      data,
      message: "Prescription verified successfully",
    });
  } catch (error) {
    logger.error("verifyDoctorPrescriptionService: ", error);
    return Response.INTERNAL_SERVER_ERROR({
      message: "An unexpected error occurred while verifying the prescription.",
    });
  }
};
