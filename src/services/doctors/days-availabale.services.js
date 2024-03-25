const fs = require("fs");
const path = require("path");
const moment = require("moment");
const dbObject = require("../db/db.doctors");
const Response = require("../utils/response.utils");
const { USERTYPE, STATUS, VERIFICATIONSTATUS } = require("../utils/enum.utils");
const { getUserById } = require("../db/db.users");
const {
  doctorCouncilRegistrationEmail,
  adminDoctorCouncilRegistrationEmail,
  doctorCouncilRegistrationApprovedEmail,
  doctorCouncilRegistrationRejectedEmail,
} = require("../utils/email.utils");
const { appBaseURL } = require("../config/default.config");

//DOCTORS
exports.getDoctorAvailableDays = async (userId) => {
  try {
    //Get profile from database
    const doctor = await dbObject.getDoctorByUserId(id);

    if (!doctor) {
      return Response.NOT_FOUND({ message: "Doctor Profile Not Found" });
    }

    //destruct properties from database object
    const {
      doctor_id: doctorId,
      user_type: userType,
      user_id: userId,
      is_account_active: isAccountActive,
    } = doctor;

    //Check if the profile requested belongs to the requesting user
    //Check if the user type is a doctor
    if (id !== userId || userType !== USERTYPE.DOCTOR) {
      return Response.UNAUTHORIZED({ message: "Unauthorized account access" });
    }

    const rawData = await dbObject.getCouncilRegistrationByDoctorId(doctorId);
    if (!rawData) {
      return Response.NOT_FOUND({
        message: "Medical Council Registration Not Found",
      });
    }
    const {
      council_registration_id: registrationId,
      first_name: firstName,
      last_name: lastName,
      speciality_name: specialty,
      profile_pic_url: doctorPic,
      council_name: councilName,
      years_of_experience: yearsOfExperience,
      is_profile_approved: isProfileApproved,
      registration_number: regNumber,
      registration_year: regYear,
      registration_document_url: regDocumentUrl,
      certificate_issued_date: certIssuedDate,
      certificate_expiry_date: certExpiryDate,
      registration_status: regStatus,
      rejection_reason: rejectionReason,
      verified_by: verifiedBy,
    } = rawData;

    const registration = {
      registrationId,
      doctor: `${firstName} ${lastName}`,
      specialty,
      doctorPic: `${appBaseURL}/user-profile/${doctorPic}`,
      councilName,
      yearsOfExperience,
      isProfileApproved,
      regNumber,
      regYear,
      regDocumentUrl: `${appBaseURL}/doctors/council-registration/doc/${regDocumentUrl}`,
      certIssuedDate: moment(certIssuedDate).format("YYYY-MM-DD"),
      certExpiryDate: moment(certExpiryDate).format("YYYY-MM-DD"),
      regStatus,
      rejectionReason,
      verifiedBy,
    };

    return Response.SUCCESS({ data: registration });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.createDoctorAvailableDays = async ({ userId, days }) => {
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
      await dbObject.getCouncilRegistrationByDoctorId(doctorId);

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

exports.updateDoctorAvailableDays = async ({
  registrationId,
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
        message: "Please upload medical council registration document.",
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

    const {
      council_registration_id: councilRegistrationId,
      registration_status: registrationStatus,
      reject_reason: rejectReason,
      registration_document_url: documentUrl,
    } = await dbObject.getCouncilRegistrationById(registrationId);

    if (documentUrl) {
      // delete old profile pic from file system
      const file = path.join(__dirname, "../public/upload/media/", documentUrl);

      if (fs.existsSync(file)) {
        await fs.promises.unlink(file);
      }
    }

    await dbObject.updateDoctorMedicalCouncilRegistration({
      registrationId,
      doctorId,
      certExpiryDate,
      certIssuedDate,
      regNumber,
      councilId,
      filename: file.filename,
      regYear,
    });

    //send an email with further instructions

    // await Promise.all([
    //   adminDoctorCouncilRegistrationEmail({
    //     doctorName: `${doctorFirstName} ${doctorLastName}`,
    //   }),
    //   doctorCouncilRegistrationEmail({
    //     doctorEmail,
    //     doctorName: `${doctorFirstName} ${doctorLastName}`,
    //   }),
    // ]);

    return Response.SUCCESS({
      message:
        "Medical Council Registration Successfully Updated. Your information is awaiting approval. You will be notified by email when once your documents are approved.",
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};


exports.getDoctorTimeSlots = async (userId) => {
  try {
    const rawData = await dbObject.getAllMedicalCouncilRegistration();

    const registrations = rawData.map(
      ({
        council_registration_id: registrationId,
        doctor_id: doctorId,
        first_name: firstName,
        last_name: lastName,
        specialty_name: specialty,
        profile_pic_url: doctorPic,
        council_name: councilName,
        years_of_experience: yearsOfExperience,
        is_profile_approved: isProfileApproved,
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
          doctor: `${firstName} ${lastName}`,
          specialty,
          doctorPic: `${appBaseURL}/user-profile/${doctorPic}`,
          councilName,
          yearsOfExperience,
          isProfileApproved,
          regNumber,
          regYear,
          regDocumentUrl: `${appBaseURL}/admin/council-registration/doc/${regDocumentUrl}`,
          certIssuedDate: moment(certIssuedDate).format("YYYY-MM-DD"),
          certExpiryDate: moment(certExpiryDate).format("YYYY-MM-DD"),
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


