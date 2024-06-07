const moment = require("moment");
const {
  getAppointmentPrescriptions,
  createAppointmentPrescriptions,
  updateAppointmentPrescriptions,

  getAppointmentPrescriptionById,
} = require("../db/db.prescriptions");
const Response = require("../utils/response.utils");

const {
  generateVerificationToken,
  hashUsersPassword,
  encryptText,
  decryptText,
} = require("../utils/auth.utils");
const { sendPrescriptionToken } = require("../utils/sms.utils");
const { getAppointmentByID } = require("../db/db.appointments.patients");
const { getPatientById } = require("../db/db.patients");

exports.getAppointmentPrescriptions = async (id) => {
  try {
    const rawData = await getAppointmentPrescriptions(id);

    const prescriptions = rawData.map(
      ({
        prescription_id: prescrtiptionId,
        appointment_id: appointmentId,
        created_at: dateCreated,
        updated_at: dateUpdated,
      }) => ({
        prescrtiptionId,
        appointmentId,
        createdAt: moment(dateCreated).format("YYYY-MM-DD"),
        updatedAt: moment(dateUpdated).format("YYYY-MM-DD"),
      }),
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
