const moment = require("moment");
const {
  getAppointmentPrescriptions,
  getAppointmentPrescriptionById,
} = require("../db/db.prescriptions");
const Response = require("../utils/response.utils");
const { decryptText } = require("../utils/auth.utils");
// const {
//   getPatientAppointmentById,
//   getAppointmentByID,
// } = require("../db/db.appointments.patients");
// const { getPatientById } = require("../db/db.patients");

exports.getAppointmentPrescriptions = async (id) => {
  try {
    const prescriptions = await getAppointmentPrescriptions(id);

    const data = prescriptions.map(
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

    return Response.SUCCESS({ data });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.getAppointmentPrescriptionById = async (presId) => {
  try {
    const prescription = await getAppointmentPrescriptionById(presId);

    if (!prescription) {
      return Response.NOT_FOUND({
        message: "Prescription Not Found. Try again",
      });
    }
    const { access_jwt: hashedToken } = prescription;

    const {
      prescription_id: prescriptionId,
      appointment_id: appointmentId,
      diagnosis,
      medicines,
      doctors_comment: doctorComment,
      created_at: dateCreated,
      updated_at: dateUpdated,
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
      encryptedText: doctorComment,
      key: hashedToken,
    });

    const data = {
      prescriptionId,
      appointmentId,
      diagnosis: decryptedDiagnosis,
      medicines: JSON.parse(decryptedMedicines),
      comment: decryptedComment,
      createdAt: moment(dateCreated).format("YYYY-MM-DD"),
      updatedAt: moment(dateUpdated).format("YYYY-MM-DD"),
    };

    return Response.SUCCESS({ data });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
