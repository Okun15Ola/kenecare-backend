const moment = require("moment");
const dbObject = require("../../db/db.doctors");
const Response = require("../../utils/response.utils");
const {
  doctorCouncilRegistrationApprovedEmail,
  doctorCouncilRegistrationRejectedEmail,
} = require("../../utils/email.utils");
const { appBaseURL } = require("../../config/default.config");
const { getFileUrlFromS3Bucket } = require("../../utils/aws-s3.utils");
const redisClient = require("../../config/redis.config");

exports.getAllCouncilRegistrations = async () => {
  try {
    const cacheKey = "admin-doctors-council-registrations:all";
    const cachedData = await redisClient.get(cacheKey);
    console.log(cachedData);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }
    const rawData = await dbObject.getAllMedicalCouncilRegistration();
    const promises = rawData.map(
      async ({
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
        const url = await getFileUrlFromS3Bucket(regDocumentUrl);
        return {
          registrationId,
          doctorId,
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
      },
    );
    const registrations = await Promise.all(promises);
    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(registrations),
    });
    return Response.SUCCESS({ data: registrations });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
exports.getCouncilRegistration = async (id) => {
  try {
    const cacheKey = `admin-doctors-council-registrations:${id}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }
    const rawData = await dbObject.getCouncilRegistrationById(id);

    if (!rawData) {
      return Response.NOT_FOUND({
        message: "Medical Council Registration Not Found",
      });
    }
    const {
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
    } = rawData;

    const documentUrl = await getFileUrlFromS3Bucket(regDocumentUrl);

    const registration = {
      registrationId,
      doctorId,
      doctor: `${firstName} ${lastName}`,
      specialty,
      doctorPic: `${appBaseURL}/user-profile/${doctorPic}`,
      councilName,
      yearsOfExperience,
      isProfileApproved,
      regNumber,
      regYear,
      regDocumentUrl: documentUrl,
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
exports.approveCouncilRegistration = async ({ regId, userId }) => {
  try {
    const rawData = await dbObject.getCouncilRegistrationById(regId);
    if (!rawData) {
      return Response.NOT_FOUND({
        message: "Medical Council Registration Not Found",
      });
    }

    const {
      registration_status: registrationStats,
      doctor_id: doctorId,
      first_name: firstName,
      last_name: lastName,
    } = rawData;

    if (registrationStats === "approved") {
      return Response.NOT_MODIFIED();
    }

    const [doctor] = await Promise.allSettled([
      dbObject.getDoctorById(doctorId),
      dbObject.approveDoctorMedicalCouncilRegistrationById({
        registrationId: regId,
        approvedBy: userId,
      }),
    ]).catch((error) => {
      console.error(error);
      throw error;
    });

    const { email: doctorEmail } = doctor.value;

    //  send email notification to doctor upon approval
    await doctorCouncilRegistrationApprovedEmail({
      doctorEmail,
      doctorName: `${firstName} ${lastName}`,
    });
    return Response.SUCCESS({
      message: "Doctor's Medical Council Registration Approved Successfully",
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
exports.rejectCouncilRegistration = async ({
  regId,
  rejectionReason,
  userId,
}) => {
  try {
    const rawData = await dbObject.getCouncilRegistrationById(regId);
    if (!rawData) {
      return Response.NOT_FOUND({
        message: "Medical Council Registration Not Found",
      });
    }

    const {
      registration_status: registrationStatus,
      doctor_id: doctorId,
      first_name: firstName,
      last_name: lastName,
    } = rawData;

    if (registrationStatus === "rejected") {
      return Response.NOT_MODIFIED();
    }

    const [doctor] = await Promise.allSettled([
      dbObject.getDoctorById(doctorId),
      dbObject.rejectDoctorMedicalCouncilRegistrationById({
        registrationId: regId,
        rejectionReason,
        approvedBy: userId,
      }),
    ]).catch((error) => {
      console.error(error);
      throw error;
    });

    const { email: doctorEmail } = doctor.value;

    //  send email notification to doctor upon approval
    await doctorCouncilRegistrationRejectedEmail({
      doctorEmail,
      doctorName: `${firstName} ${lastName}`,
    });
    return Response.SUCCESS({
      message: "Doctor's Medical Council Registration Rejected Successfully",
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
