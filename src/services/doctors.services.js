const dbObject = require("../db/db.doctors");
const Response = require("../utils/response.utils");
const { USERTYPE, STATUS, VERIFICATIONSTATUS } = require("../utils/enum.utils");
const { getUserById } = require("../db/db.users");
const {
  doctorCouncilRegistrationEmail,
  adminDoctorCouncilRegistrationEmail,
  adminDoctorProfileRegistrationEmail,
} = require("../utils/email.utils");
const { appBaseURL } = require("../config/default.config");
const { doctorProfileApprovalSms } = require("../utils/sms.utils");
const path = require("path");
const fs = require("fs");
const { createDoctorWallet } = require("../db/db.doctor-wallet");
const { hashUsersPassword } = require("../utils/auth.utils");

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
          profile_pic_url: profilePic,
          specialization_id: specialtyId,
          speciality_name: specialization,
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
            profilePic: profilePic
              ? `${appBaseURL}/user-profile/${profilePic}`
              : null,
            specialtyId,
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
          profile_pic_url: profilePic,
          specialization_id: specialtyId,
          speciality_name: specialization,
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
            profilePic: profilePic
              ? `${appBaseURL}/user-profile/${profilePic}`
              : null,
            specialtyId,
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
exports.getDoctorBySpecialtyId = async (specialityId) => {
  try {
    const rawData = await dbObject.getDoctorsBySpecializationId(specialityId);
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
          profile_pic_url: profilePic,
          specialization_id: specialtyId,
          speciality_name: specialization,
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
            profilePic: profilePic
              ? `${appBaseURL}/user-profile/${profilePic}`
              : null,
            specialityId,
            specialization,
            qualifications,
            consultationFee: `SLE ${parseInt(consultationFee)}`,
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
      return Response.NOT_FOUND({ message: "Doctor Profile Not Found" });
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
      specialization_id: specialtyId,
      speciality_name: specialization,
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
      profilePic: profilePic
        ? `${appBaseURL}/user-profile/${profilePic}`
        : null,
      specialtyId,
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

exports.getDoctorById = async (id) => {
  try {
    //Get profile from database
    const data = await dbObject.getDoctorById(id);

    if (!data) {
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
      specialization_id: specialtyId,
      speciality_name: specialization,
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
    } = data;

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
      profilePic: profilePic
        ? `${appBaseURL}/user-profile/${profilePic}`
        : null,
      specialtyId,
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

    const profileCreated = await dbObject.createDoctor({
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

    // Send Email to admins
    await adminDoctorProfileRegistrationEmail({
      doctorName: `${firstName} ${middleName} ${lastName}`,
    });

    const hashedPin = await hashUsersPassword("1234");
    await createDoctorWallet({
      doctorId: profileCreated.insertId,
      pin: hashedPin,
    });

    return Response.CREATED({
      message:
        "Doctor profile created successfully. Please proceed to submitting Medical Council Registration Information.",
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.updateDoctorProfile = async ({
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
    const doctor = await dbObject.getDoctorByUserId(userId);

    if (!doctor) {
      return Response.NOT_FOUND({ message: "Doctor Profile Not Found" });
    }

    const {
      user_type: userType,
      doctor_id: doctorId,
      is_account_active: isAccountActive,
      is_profile_approved: isProfileApproved,
    } = doctor;

    //check if the logged in user is of type 'doctor'
    if (userType !== USERTYPE.DOCTOR) {
      return Response.UNAUTHORIZED({
        message:
          "Unauthorized action, you must register as a doctor to create a doctor profile",
      });
    }

    // Check if the profile is active
    if (isAccountActive !== STATUS.ACTIVE) {
      return Response.UNAUTHORIZED({
        message: "Doctor Profile has been deactivated. Please Contact Admin",
      });
    }

    //TODO Check if the profile has been verified
    if (isProfileApproved !== VERIFICATIONSTATUS.VERIFIED) {
      return Response.UNAUTHORIZED({
        message:
          "Requested Doctor Profile has not been approved. Please contact admin for further information",
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
exports.updateDoctorProfilePicture = async ({ userId, imageUrl }) => {
  try {
    const doctor = await dbObject.getDoctorByUserId(userId);
    if (!doctor) {
      return Response.NOT_FOUND({ message: "Doctor Profile Not Found" });
    }
    const { doctor_id: doctorId, profile_pic_url } = doctor;

    if (profile_pic_url) {
      // delete old profile pic from file system
      const file = path.join(
        __dirname,
        "../public/upload/profile_pics/",
        profile_pic_url
      );
      if (fs.existsSync(file)) {
        await fs.promises.unlink(file);
      }
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

exports.approveDoctorProfile = async ({ doctorId, approvedBy }) => {
  try {
    const doctor = await dbObject.getDoctorById(doctorId);
    if (!doctor) {
      return Response.NOT_FOUND({ message: "Doctor Not Found" });
    }

    const {
      is_profile_approved: isProfileApproved,
      mobile_number: mobileNumber,
      first_name: firstName,
      last_name: lastName,
    } = doctor;

    if (isProfileApproved) {
      return Response.NOT_MODIFIED();
    }

    await Promise.allSettled([
      dbObject.approveDoctorProfileByDoctorId({ doctorId, approvedBy }),
      doctorProfileApprovalSms({
        mobileNumber,
        doctorName: `${firstName} ${lastName}`,
      }),
    ]);

    return Response.SUCCESS({
      message: "Doctor profile approved successfully.",
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
