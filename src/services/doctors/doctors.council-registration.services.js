const moment = require("moment");
const dbObject = require("../../repository/doctors.repository");
const Response = require("../../utils/response.utils");
const { USERTYPE } = require("../../utils/enum.utils");
const { getUserById } = require("../../repository/users.repository");
const {
  doctorCouncilRegistrationEmail,
  adminDoctorCouncilRegistrationEmail,
} = require("../../utils/email.utils");
const { appBaseURL } = require("../../config/default.config");
const {
  uploadFileToS3Bucket,
  getFileUrlFromS3Bucket,
} = require("../../utils/aws-s3.utils");
const { generateFileName } = require("../../utils/file-upload.utils");
const redisClient = require("../../config/redis.config");

// DOCTORS
exports.getDoctorCouncilRegistration = async (id) => {
  try {
    const cacheKey = `doctor-council-registration:${id}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }
    // Get profile from database
    const doctor = await dbObject.getDoctorByUserId(id);

    if (!doctor) {
      return Response.NOT_FOUND({ message: "Doctor Profile Not Found" });
    }

    // destruct properties from database object
    const {
      doctor_id: doctorId,
      user_type: userType,
      user_id: userId,
    } = doctor;

    // Check if the profile requested belongs to the requesting user
    // Check if the user type is a doctor
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

    const url = await getFileUrlFromS3Bucket(regDocumentUrl);

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
      regDocumentUrl: url,
      certIssuedDate: moment(certIssuedDate).format("YYYY-MM-DD"),
      certExpiryDate: moment(certExpiryDate).format("YYYY-MM-DD"),
      regStatus,
      rejectionReason,
      verifiedBy,
    };

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(registration),
    });
    return Response.SUCCESS({ data: registration });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

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
    const user = await getUserById(userId);
    if (!user) {
      return Response.NOT_FOUND({
        message: "Error Creating Doctor Profile, please try again!",
      });
    }
    const { user_type: userType } = user;

    if (userType !== USERTYPE.DOCTOR) {
      return Response.UNAUTHORIZED({
        message: "Unauthorized Action.",
      });
    }
    const doctor = await dbObject.getDoctorByUserId(userId);
    if (!doctor) {
      return Response.BAD_REQUEST({
        message: "Doctor Profile does not exist please create a profile. ",
      });
    }
    const {
      doctor_id: doctorId,
      first_name: doctorFirstName,
      last_name: doctorLastName,
      email: doctorEmail,
    } = doctor;

    const councilRegistrationExist =
      await dbObject.getCouncilRegistrationByDoctorId(doctorId);

    if (councilRegistrationExist) {
      const {
        registration_status: registrationStatus,
        reject_reason: rejectReason,
      } = councilRegistrationExist;

      //  check if it has been approved
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

    const { buffer, mimetype } = file;
    const fileName = `council_cert_${generateFileName(file)}`;

    // upload file to AWS
    // Save record to database
    // send an email with further instructions

    await Promise.all([
      uploadFileToS3Bucket({
        fileName,
        buffer,
        mimetype,
      }),
      dbObject.createDoctorMedicalCouncilRegistration({
        doctorId,
        councilId,
        regNumber,
        regYear,
        certIssuedDate,
        certExpiryDate,
        fileName,
      }),
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

exports.updateDoctorCouncilRegistration = async ({
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

    const registration =
      await dbObject.getCouncilRegistrationByDoctorId(doctorId);
    if (!registration) {
      return Response.NOT_FOUND({ message: "Council registration not found" });
    }

    const {
      council_registration_id: registrationId,
      registration_document_url: fileName,
    } = registration;

    const { buffer, mimetype } = file;

    await Promise.all([
      uploadFileToS3Bucket({
        fileName,
        buffer,
        mimetype,
      }),
      dbObject.updateDoctorMedicalCouncilRegistration({
        registrationId,
        doctorId,
        certExpiryDate,
        certIssuedDate,
        regNumber,
        councilId,
        fileName,
        regYear,
      }),
    ]);

    //  Deactivate doctors profile until registration has been reverified
    // send an email with further instructions

    await Promise.all([
      adminDoctorCouncilRegistrationEmail({
        doctorName: `${doctorFirstName} ${doctorLastName}`,
      }),
      doctorCouncilRegistrationEmail({
        doctorEmail,
        doctorName: `${doctorFirstName} ${doctorLastName}`,
      }),
    ]);

    return Response.SUCCESS({
      message:
        "Medical Council Registration Successfully Updated. Your account will be temporarily disabled until after verification has been completed. You will be notified by email when once your documents are approved.",
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
