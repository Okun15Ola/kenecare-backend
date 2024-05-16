const moment = require("moment");
const {
  getAppointmentPrescriptions,
  getAppointmentPrescriptionById,
} = require("../db/db.prescriptions");
const Response = require("../utils/response.utils");
const { getUserById } = require("../db/db.users");
const {
  generateVerificationToken,
  hashUsersPassword,
  encryptText,
  decryptText,
  comparePassword,
} = require("../utils/auth.utils");
const {
  getPatientAppointmentById,
  getAppointmentByID,
} = require("../db/db.appointments.patients");
const { getPatientById } = require("../db/db.patients");

exports.getAppointmentPrescriptions = async (id) => {
  try {
    const rawData = await getAppointmentPrescriptions(id);

    const prescriptions = rawData.map(
      ({
        prescription_id: prescrtiptionId,
        appointment_id: appointmentId,
        created_at,
        updated_at,
      }) => {
        return {
          prescrtiptionId,
          appointmentId,
          createdAt: moment(created_at).format("YYYY-MM-DD"),
          updatedAt: moment(updated_at).format("YYYY-MM-DD"),
        };
      }
    );

    return Response.SUCCESS({ data: prescriptions });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.getAppointmentPrescriptionById = async ({ presId, accessToken }) => {
  try {
    const prescription = await getAppointmentPrescriptionById(presId);

    if (!prescription) {
      return Response.NOT_FOUND({
        message: "Prescription Not Found. Try again",
      });
    }
    const { access_jwt: hashedToken } = prescription;

    // Check accesstoken
    const isTokenMatch = await comparePassword({
      plainPassword: accessToken,
      hashedPassword: hashedToken,
    });

    if (!isTokenMatch) {
      return Response.BAD_REQUEST({
        message: "Invalid prescription access token",
      });
    }

    const {
      prescription_id: prescriptionId,
      appointment_id: appointmentId,
      diagnosis,
      medicines,
      doctors_comment,
      created_at,
      updated_at,
    } = prescription;

    const decryptedDiagnosis = decryptText({
      encryptedText: diagnosis,
      key: hashedToken,
    });
    const decryptedMedicines = decryptText({
      encryptedText: medicines,
      key: hashedToken,
    });
    const decryptedComment = decryptText({
      encryptedText: doctors_comment,
      key: hashedToken,
    });

    const data = {
      prescriptionId,
      appointmentId,
      diagnosis: decryptedDiagnosis,
      medicines: JSON.parse(decryptedMedicines),
      comment: decryptedComment,
      createdAt: moment(created_at).format("YYYY-MM-DD"),
      updatedAt: moment(updated_at).format("YYYY-MM-DD"),
    };

    return Response.SUCCESS({ data });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
