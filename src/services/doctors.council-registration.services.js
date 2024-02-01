const dbObject = require("../db/db.doctors");
const Response = require("../utils/response.utils");
const { USERTYPE, STATUS, VERIFICATIONSTATUS } = require("../utils/enum.utils");
const { getUserById } = require("../db/db.users");
const {
  doctorCouncilRegistrationEmail,
  adminDoctorCouncilRegistrationEmail,
} = require("../utils/email.utils");

exports.getCouncilRegistrations = async () => {
  try {
    const rawData = await dbObject.getAllMedicalCouncilRegistration();
    const registrations = rawData.map(
      ({
        council_registration_id: registrationId,
        doctor_id: doctorId,
        medical_council_id: councilId,
        registration_number: regNumber,
        registration_year: regYear,
        registration_document_url: regDocumentUrl,
        certificate_issued_date: certIssuedDate,
        certificate_expiry_date: certExpiryDate,
        registration_status: regStatus,
        rejection_reason: rejectionReason,
        verified_by: verifiedBy,
      }) => {
        return {
          registrationId,
          doctorId,
          councilId,
          regNumber,
          regYear,
          regDocumentUrl,
          certIssuedDate,
          certExpiryDate,
          regStatus,
          rejectionReason,
          verifiedBy,
        };
      }
    );
    return Response.SUCCESS({ data: registrations });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
exports.getCouncilRegistration = async (id) => {
  try {
    const rawData = await dbObject.getMedicalCouncilRegistrationById(id);
    const registrations = rawData.map(
      ({
        council_registration_id: registrationId,
        doctor_id: doctorId,
        medical_council_id: councilId,
        registration_number: regNumber,
        registration_year: regYear,
        registration_document_url: regDocumentUrl,
        certificate_issued_date: certIssuedDate,
        certificate_expiry_date: certExpiryDate,
        registration_status: regStatus,
        rejection_reason: rejectionReason,
        verified_by: verifiedBy,
      }) => {
        return {
          registrationId,
          doctorId,
          councilId,
          regNumber,
          regYear,
          regDocumentUrl,
          certIssuedDate,
          certExpiryDate,
          regStatus,
          rejectionReason,
          verifiedBy,
        };
      }
    );
    return Response.SUCCESS({ data: registrations });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/**
 * createDoctorCouncilRegistration({
      userId,
      councilId,
      regNumber,
      regYear,
      certIssuedDate,
      certExpirtyDate,
      file,
    });
 */
exports.createDoctorCouncilRegistration = async ({
  userId,
  councilId,
  regNumber,
  regYear,
  certIssuedDate,
  certExpiryDate,
  file,
}) => {
  try {
    if (!file) {
      return Response.BAD_REQUEST({
        message: "Please upload medical council registration certificate.",
      });
    }
    const { user_type: userType } = await getUserById(userId);

    if (userType !== USERTYPE.DOCTOR) {
      return Response.UNAUTHORIZED({
        message: "Unauthorized Action.",
      });
    }
    const {
      doctor_id: doctorId,
      first_name: doctorFirstName,
      last_name: doctorLastName,
      email: doctorEmail,
    } = await dbObject.getDoctorByUserId(userId);
    if (!doctorId) {
      return Response.BAD_REQUEST({
        message: "Doctor Profile does not exist please create a profile. ",
      });
    }

    const councilRegistrationExist =
      await dbObject.getDoctorsCouncilRegistrationById(doctorId);

    if (councilRegistrationExist) {
      const {
        council_registration_id: councilRegistrationId,
        registration_status: registrationStatus,
        reject_reason: rejectReason,
      } = councilRegistrationExist;

      //TODO check if it has been approved
      if (registrationStatus === "pending") {
        return Response.BAD_REQUEST({
          message:
            "Medical Council Registration PENDING. Approval takes up to 48 hours, if you're experiencing any delays please contact the admin for further instructions.",
        });
      }
      if (registrationStatus === "rejected") {
        return Response.BAD_REQUEST({
          message: `Medical Council Registration was rejected by admin. Reason: ${rejectReason}`,
        });
      }

      if (registrationStatus === "approved") {
        return Response.NOT_MODIFIED();
      }
    }

    const done = await dbObject.createDoctorMedicalCouncilRegistration({
      doctorId,
      councilId,
      regNumber,
      regYear,
      certIssuedDate,
      certExpiryDate,
      filename: file.filename,
    });

    //send an email with further instructions

    await Promise.all([
      adminDoctorCouncilRegistrationEmail({
        doctorName: `${doctorFirstName} ${doctorLastName}`,
      }),
      doctorCouncilRegistrationEmail({
        doctorEmail,
        doctorName: `${doctorFirstName} ${doctorLastName}`,
      }),
    ]);

    return Response.CREATED({
      message:
        "Medical Council Registration Successfully Submitted. Your information is awaiting approval. You will be notified by email when once your documents are approved.",
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
