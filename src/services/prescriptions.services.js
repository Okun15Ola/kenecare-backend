const moment = require("moment");
const {
  getAppointmentPrescriptions,
  createAppointmentPrescriptions,
  updateAppointmentPrescriptions,
  getSimilarPrescription,
} = require("../db/db.prescriptions");
const Response = require("../utils/response.utils");
const { getUserById } = require("../db/db.users");
const {
  generateVerificationToken,
  hashUsersPassword,
  encryptText,
} = require("../utils/auth.utils");

exports.getAppointmentPrescriptions = async (id) => {
  try {
    const rawData = await getAppointmentPrescriptions(id);

    const prescriptions = rawData.map(
      ({
        prescription_id: prescrtiptionId,
        appointment_id: appointmentId,
        diagnosis,
        medicines,
        doctors_comment: comment,
        created_at,
        updated_at,
      }) => {
        return {
          prescrtiptionId,
          appointmentId,
          diagnosis,
          medicines: JSON.parse(medicines),
          comment,
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

exports.createPrescription = async ({
  userId,
  appointmentId,
  diagnosis,
  medicines,
  comment,
}) => {
  try {
    medicines = JSON.stringify(medicines);

    const similarPrescription = await getSimilarPrescription({
      appointmentId,
      diagnosis,
      medicines,
      comment,
    });

    if (similarPrescription) {
      return Response.BAD_REQUEST({
        message:
          "Similar prescription already exists for the selected appointment, please update or create a different prescription for the appointment",
      });
    }

    //TODO Generate Prescription Access Token
    const accessToken = generateVerificationToken();

    //TODO Hash Generated Access Token
    const hashedToken = await hashUsersPassword(accessToken);

    //TODO Use Hashed Token to encyrpt presctiption
    const encDiagnosis = encryptText(diagnosis, hashedToken);
    const encMedicines = encryptText(medicines, hashedToken);
    const encComment = encryptText(medicines, hashedToken);

    //Save encrypted prescription with access token in database
    await createAppointmentPrescriptions({
      appointmentId,
      diagnosis: encDiagnosis,
      medicines: encMedicines,
      comment: encComment,
      accessToken: hashedToken,
    });

    //TODO send access token to user for later use
    await send

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
    medicines = JSON.stringify(medicines);

    await updateAppointmentPrescriptions({
      appointmentId,
      prescriptionId,
      diagnosis,
      medicines,
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
