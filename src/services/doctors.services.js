const dbObject = require("../db/db.doctors");
const Response = require("../utils/response.utils");
const { USERTYPE, STATUS, VERIFICATIONSTATUS } = require("../utils/enum.utils");
const { getUserById } = require("../db/db.users");
const {
  doctorCouncilRegistrationEmail,
  adminDoctorCouncilRegistrationEmail,
} = require("../utils/email.utils");

exports.getAllDoctors = async () => {
  try {
    const rawData = await dbObject.getAllDoctors();
    if (rawData) {
      const doctors = rawData.map(
        ({
          doctor_id: doctorId,
          title,
          first_name: firstName,
          middle_name: middleName,
          last_name: lastName,
          gender,
          professional_summary: professionalSummary,
          profile_pic_url,
          profilePic,
          specialization_name: specialization,
          qualifications,
          consultation_fee: consultationFee,
          city_name: location,
          latitude,
          longitude,
          years_of_experience: yearOfExperience,
          is_profile_approved: isProfileApproved,
          mobile_number: mobileNumber,
          email,
          user_type: userType,
          is_account_active: isAccountActive,
        }) => {
          return {
            doctorId,
            title,
            firstName,
            middleName,
            lastName,
            gender,
            professionalSummary,
            profile_pic_url,
            profilePic,
            specialization,
            qualifications,
            consultationFee,
            location,
            latitude,
            longitude,
            yearOfExperience,
            isProfileApproved,
            mobileNumber,
            email,
            userType,
            isAccountActive,
          };
        }
      );

      return Response.SUCCESS({ data: doctors });
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};
exports.getDoctorByQuery = async ({ locationId, query }) => {
  try {
    const rawData = await dbObject.getDoctorByQuery({ locationId, query });
    if (rawData) {
      const doctors = rawData.map(
        ({
          doctor_id: doctorId,
          title,
          first_name: firstName,
          middle_name: middleName,
          last_name: lastName,
          gender,
          professional_summary: professionalSummary,
          profile_pic_url,
          profilePic,
          specialization_name: specialization,
          qualifications,
          consultation_fee: consultationFee,
          city_name: location,
          latitude,
          longitude,
          years_of_experience: yearOfExperience,
          is_profile_approved: isProfileApproved,
          mobile_number: mobileNumber,
          email,
          user_type: userType,
          is_account_active: isAccountActive,
        }) => {
          return {
            doctorId,
            title,
            firstName,
            middleName,
            lastName,
            gender,
            professionalSummary,
            profile_pic_url,
            profilePic,
            specialization,
            qualifications,
            consultationFee,
            location,
            latitude,
            longitude,
            yearOfExperience,
            isProfileApproved,
            mobileNumber,
            email,
            userType,
            isAccountActive,
          };
        }
      );

      return Response.SUCCESS({ data: doctors });
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.getDoctorByUser = async (id) => {
  try {
    //Get profile from database
    const rawData = await dbObject.getDoctorByUserId(id);

    if (!rawData) {
      return Response.NOT_FOUND({ message: "Patient Profile Not Found" });
    }
    //destruct properties from database object
    const {
      doctor_id: doctorId,
      title,
      first_name: firstName,
      middle_name: middleName,
      last_name: lastName,
      gender,
      professional_summary: professionalSummary,
      profile_pic_url: profilePic,
      specialization_name: specialization,
      qualifications,
      consultation_fee: consultationFees,
      city_name: city,
      years_of_experience: yearOfExperience,
      is_profile_approved: isProfileApproved,
      user_id: userId,
      mobile_number: mobileNumber,
      email,
      user_type: userType,
      is_account_active: isAccountActive,
    } = rawData;

    //TODO Check if the profile requested belongs to the requesting user
    if (id !== userId || userType !== USERTYPE.DOCTOR) {
      return Response.UNAUTHORIZED({ message: "Unauthorized account access" });
    }

    //TODO Check if the profile has been verified
    // if (isProfileApproved !== VERIFICATIONSTATUS.VERIFIED) {
    //   return Response.UNAUTHORIZED({
    //     message:
    //       "Requested Doctor Profile has not been approved. Please contact admin for further information",
    //   });
    // }

    const doctor = {
      doctorId,
      userId,
      title,
      firstName,
      middleName,
      lastName,
      gender,
      mobileNumber,
      email,
      professionalSummary,
      profilePic,
      specialization,
      qualifications,
      consultationFees,
      city,
      yearOfExperience,
      isProfileApproved,
    };

    return Response.SUCCESS({ data: doctor });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.getDoctorCouncilRegistration = async (id) => {
  try {
    //Get profile from database
    const rawData = await dbObject.getDoctorByUserId(id);

    if (!rawData) {
      return Response.NOT_FOUND({ message: "Doctor Profile Not Found" });
    }

    //destruct properties from database object
    const {
      doctor_id: doctorId,
      user_type: userType,
      user_id: userId,
      is_account_active: isAccountActive,
    } = rawData;

    //Check if the profile requested belongs to the requesting user
    //Check if the user type is a doctor
    if (id !== userId || userType !== USERTYPE.DOCTOR) {
      return Response.UNAUTHORIZED({ message: "Unauthorized account access" });
    }

    //TODO Check if the profile has been verified
    // if (isProfileApproved !== VERIFICATIONSTATUS.VERIFIED) {
    //   return Response.UNAUTHORIZED({
    //     message:
    //       "Requested Doctor Profile has not been approved. Please contact admin for further information",
    //   });
    // }

    const data = await dbObject.getDoctorMedicalCouncilRegistration({
      doctorId,
    });

    return Response.SUCCESS({ data });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.getDoctorById = async (doctorId) => {
  try {
    //Get profile from database
    const rawData = await dbObject.getDoctorById(doctorId);

    if (!rawData) {
      return Response.NOT_FOUND({ message: "Doctor Not Found" });
    }
    //destruct properties from database object
    const {
      doctor_id: doctorId,
      title,
      first_name: firstName,
      middle_name: middleName,
      last_name: lastName,
      gender,
      professional_summary: professionalSummary,
      profile_pic_url: profilePic,
      specialization_name: specialization,
      qualifications,
      consultation_fee: consultationFees,
      city_name: city,
      years_of_experience: yearOfExperience,
      is_profile_approved: isProfileApproved,
      user_id: userId,
      mobile_number: mobileNumber,
      email,
      user_type: userType,
      is_account_active: isAccountActive,
    } = rawData;

    const doctor = {
      doctorId,
      userId,
      title,
      firstName,
      middleName,
      lastName,
      gender,
      mobileNumber,
      email,
      professionalSummary,
      profilePic,
      specialization,
      qualifications,
      consultationFees,
      city,
      yearOfExperience,
      isProfileApproved,
    };

    return Response.SUCCESS({ data: doctor });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.createDoctorProfile = async ({
  userId,
  title,
  firstName,
  middleName,
  lastName,
  gender,
  professionalSummary,
  specializationId,
  qualifications,
  consultationFee,
  cityId,
  yearOfExperience,
}) => {
  try {
    const { user_type: userType } = await getUserById(userId);

    if (userType !== USERTYPE.DOCTOR) {
      return Response.UNAUTHORIZED({
        message:
          "Unauthorized action, you must register as a doctor to create a doctor profile",
      });
    }
    const doctorExist = await dbObject.getDoctorByUserId(userId);
    if (doctorExist) {
      return Response.BAD_REQUEST({
        message: "Doctor Profile already exist for this user",
      });
    }

    await dbObject.createDoctor({
      userId,
      title,
      firstName,
      middleName,
      lastName,
      gender,
      professionalSummary,
      specializationId,
      qualifications,
      consultationFee,
      cityId,
      yearOfExperience,
    });

    //TODO send an email with further instructions
    Promise.all([
      await doctorCouncilRegistrationEmail({}),
      await adminDoctorCouncilRegistrationEmail({}),
    ]);
    //TODO Send Email to admins

    return Response.CREATED({
      message:
        "Doctor profile created successfully. Please check your email for further instructions",
    });
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
exports.updateDoctorProfile = async ({
  doctorId,
  userId,
  title,
  firstName,
  middleName,
  lastName,
  gender,
  professionalSummary,
  specializationId,
  qualifications,
  consultationFee,
  cityId,
  yearOfExperience,
}) => {
  try {
    const { user_type: userType } = await getUserById(userId);

    if (userType !== USERTYPE.DOCTOR) {
      return Response.UNAUTHORIZED({
        message:
          "Unauthorized action, you must register as a doctor to create a doctor profile",
      });
    }

    await dbObject.updateDoctorById({
      doctorId,
      title,
      firstName,
      middleName,
      lastName,
      gender,
      professionalSummary,
      specializationId,
      qualifications,
      consultationFee,
      cityId,
      yearOfExperience,
    });

    return Response.SUCCESS({
      message: "Doctor profile updated successfully.",
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
exports.updateDoctorProfilePicture = async ({ doctorId, imageUrl }) => {
  try {
    const { profile_pic_url } = await dbObject.getDoctorById;
    if (profile_pic_url) {
      // delete old profile pic from file system
      const file = path.join(
        __dirname,
        "../public/upload/profilepics/",
        profile_pic_url
      );
      fs.unlinkSync(file);
    }

    await dbObject.updateDoctorProfilePictureById({
      doctorId,
      imageUrl,
    });

    return Response.SUCCESS({
      message: "Doctor's profile picture updated successfully.",
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
