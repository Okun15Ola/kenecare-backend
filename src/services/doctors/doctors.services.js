const path = require("path");
const fs = require("fs");
const dbObject = require("../../repository/doctors.repository");
const Response = require("../../utils/response.utils");
const {
  USERTYPE,
  STATUS,
  VERIFICATIONSTATUS,
} = require("../../utils/enum.utils");
const { getUserById } = require("../../repository/users.repository");
const {
  adminDoctorProfileRegistrationEmail,
} = require("../../utils/email.utils");
const { doctorProfileApprovalSms } = require("../../utils/sms.utils");
const {
  createDoctorWallet,
} = require("../../repository/doctor-wallet.repository");
const { hashUsersPassword } = require("../../utils/auth.utils");
const {
  mapDoctorRow,
  mapDoctorUserProfileRow,
} = require("../../utils/db-mapper.utils");
const redisClient = require("../../config/redis.config");
const { cacheKeyBulider } = require("../../utils/caching.utils");

exports.getAllDoctors = async (limit, offset, paginationInfo) => {
  try {
    const cacheKey = cacheKeyBulider("doctors:all", limit, offset);
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({
        data: JSON.parse(cachedData),
        pagination: paginationInfo,
      });
    }

    const rawData = await dbObject.getAllDoctors(limit, offset);

    if (!rawData?.length) {
      return Response.NOT_FOUND({ message: "Doctors not found" });
    }

    const doctors = rawData.map(mapDoctorRow);

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(doctors),
    });

    return Response.SUCCESS({ data: doctors, pagination: paginationInfo });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
exports.getDoctorByQuery = async (
  locationId,
  query,
  limit,
  offset,
  paginationInfo,
) => {
  try {
    const cacheKey = cacheKeyBulider(
      `doctor-search${locationId ? `:location=${locationId}` : ""}${query ? `:query=${query}` : ""}`,
      limit,
      offset,
    );
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({
        data: JSON.parse(cachedData),
        pagination: paginationInfo,
      });
    }
    const rawData = await dbObject.getDoctorByQuery({
      locationId,
      query,
      limit,
      offset,
    });

    if (!rawData?.length) {
      return Response.NOT_FOUND({ message: "Doctors not found" });
    }

    const doctors = rawData.map(mapDoctorRow);

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(doctors),
    });

    return Response.SUCCESS({ data: doctors, pagination: paginationInfo });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
exports.getDoctorBySpecialtyId = async (
  specialityId,
  limit,
  offset,
  paginationInfo,
) => {
  try {
    const cacheKey = cacheKeyBulider(
      `doctors:speciality:${specialityId}`,
      limit,
      offset,
    );
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({
        data: JSON.parse(cachedData),
        pagination: paginationInfo,
      });
    }
    const rawData = await dbObject.getDoctorsBySpecializationId(
      specialityId,
      limit,
      offset,
    );

    if (!rawData?.length) {
      return Response.NOT_FOUND({ message: "Doctors not found" });
    }

    const doctors = rawData.map(mapDoctorRow);

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(doctors),
    });

    return Response.SUCCESS({ data: doctors, pagination: paginationInfo });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.getDoctorByUser = async (id) => {
  try {
    const cacheKey = `doctor:user:${id}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({
        data: JSON.parse(cachedData),
      });
    }
    const rawData = await dbObject.getDoctorByUserId(id);

    if (!rawData) {
      return Response.NOT_FOUND({ message: "Doctor Profile Not Found" });
    }

    const doctor = mapDoctorUserProfileRow(rawData);

    if (id !== doctor.userId || doctor.userType !== USERTYPE.DOCTOR) {
      return Response.UNAUTHORIZED({ message: "Unauthorized account access" });
    }

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(doctor),
    });

    return Response.SUCCESS({ data: doctor });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.getDoctorById = async (id) => {
  try {
    const cacheKey = `doctor:${id}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({
        data: JSON.parse(cachedData),
      });
    }
    const data = await dbObject.getDoctorById(id);

    if (!data) {
      return Response.NOT_FOUND({ message: "Doctor Not Found" });
    }

    const doctor = mapDoctorRow(data);

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(doctor),
    });

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
    const user = await getUserById(userId);
    if (!user) {
      return Response.NOT_FOUND({
        message: "Error Creating Doctor Profile, please try again!",
      });
    }
    const { user_type: userType } = user;

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

    // check if the logged in user is of type 'doctor'
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
    const { doctor_id: doctorId, profile_pic_url: profilePicUrl } = doctor;

    if (profilePicUrl) {
      // delete old profile pic from file system
      const file = path.join(
        __dirname,
        "../public/upload/profile_pics/",
        profilePicUrl,
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
