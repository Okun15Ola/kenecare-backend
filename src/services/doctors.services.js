const dbObject = require("../db/db.doctors");
const Response = require("../utils/response.utils");
const { USERTYPE, STATUS, VERIFICATIONSTATUS } = require("../utils/enum.utils");
const { getUserById } = require("../db/db.users");

exports.getAllDoctors = async () => {
  try {
    const rawData = await dbObject.getAllDoctors();
    console.log(rawData);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.getDoctorByUser = async (id) => {
  try {
    //Get profile from database
    const rawData = await dbObject.getDoctorByUserId(id);

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
    return Response.CREATED({
      message:
        "Doctor profile created successfully. Please check your email for further instructions",
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
