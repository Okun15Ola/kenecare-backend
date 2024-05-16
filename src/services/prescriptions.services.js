const moment = require("moment");
const {
  getAppointmentPrescriptions,
  createAppointmentPrescriptions,
  updateAppointmentPrescriptions,
  getSimilarPrescription,
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
const { sendPrescriptionToken } = require("../utils/sms.utils");
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

exports.getAppointmentPrescriptionById = async (id) => {
  try {
    const prescription = await getAppointmentPrescriptionById(id);

    if (!prescription) {
      return Response.NOT_FOUND({
        message: "Prescription Not Found. Try again",
      });
    }
    const { access_jwt: hashedToken } = prescription;

    // //TODO Check accesstoken
    // const isTokenMatch = await comparePassword({
    //   plainPassword: accessToken,
    //   hashedPassword: hashedToken,
    // });

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

exports.createPrescription = async ({
  userId,
  appointmentId,
  diagnosis,
  medicines,
  comment,
}) => {
  try {
    medicines = JSON.stringify(medicines);

    // const similarPrescription = await getSimilarPrescription({
    //   appointmentId,
    //   diagnosis,
    //   medicines,
    //   comment,
    // });

    // if (similarPrescription) {
    //   return Response.BAD_REQUEST({
    //     message:
    //       "Similar prescription already exists for the selected appointment, please update or create a different prescription for the appointment",
    //   });
    // }

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
    const encMedicines = encryptText(medicines, hashedToken);
    const encComment = encryptText(comment, hashedToken);

    //Save encrypted prescription with access token in database
    await createAppointmentPrescriptions({
      appointmentId,
      diagnosis: encDiagnosis,
      medicines: encMedicines,
      comment: encComment,
      accessToken: hashedToken,
    });

    // send access token to user for later use
    await sendPrescriptionToken({
      token: accessToken,
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
