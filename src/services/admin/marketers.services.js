const { v4: uuidV4 } = require("uuid");
const moment = require("moment/moment");

const {
  getAllMarketers,
  createNewMarketer,
  getMarketerById,
  getMarketerByVerficationToken,
  verifyMarketerPhoneById,
  verifyMarketerEmailById,
  deleteMarketerById,
  updateMarketerById,
  getMarketerByEmailVerficationToken,
} = require("../../repository/marketers.repository");
const Response = require("../../utils/response.utils");
const {
  generateVerificationToken,
  generateMarketerVerificaitonJwt,
  verifyMarketerEmailJwt,
} = require("../../utils/auth.utils");
const { generateFileName } = require("../../utils/file-upload.utils");
const {
  uploadFileToS3Bucket,
  deleteFileFromS3Bucket,
} = require("../../utils/aws-s3.utils");
const {
  sendMarketerVerificationTokenSMS,
  sendMarketerPhoneVerifiedSMS,
} = require("../../utils/sms.utils");
const { marketerEmailVerificationToken } = require("../../utils/email.utils");
const redisClient = require("../../config/redis.config");
const {
  mapMarketersRow,
  mapMarketersWithDocumentRow,
} = require("../../utils/db-mapper.utils");
const { cacheKeyBulider } = require("../../utils/caching.utils");

const generateReferralCode = ({ firstName, lastName }) => {
  const randomNumbers = Math.floor(100 + Math.random() * 900); // Generate 3 random numbers
  const firstPart = firstName.slice(0, 3).toUpperCase(); // Take the first 3 characters of the first name
  const lastPart = lastName.slice(0, 3).toUpperCase(); // Take the first 3 characters of the last name

  return `KC-${firstPart}${lastPart}${randomNumbers}`;
};

exports.getAllMarketersService = async (limit, offset, paginationInfo) => {
  try {
    const cacheKey = cacheKeyBulider("marketers:all", limit, offset);
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({
        data: JSON.parse(cachedData),
        pagination: paginationInfo,
      });
    }
    const rawData = await getAllMarketers(limit, offset);
    if (!rawData?.length) {
      return Response.NOT_FOUND({ message: "Marketer Not Found" });
    }
    const marketers = rawData.map(mapMarketersRow);
    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(marketers),
    });
    return Response.SUCCESS({ data: marketers, pagination: paginationInfo });
  } catch (error) {
    console.error("Service Error: ", error);
    throw error;
  }
};

exports.getMarketerByIdService = async (id) => {
  try {
    const cacheKey = `marketers:${id}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }
    const rawData = await getMarketerById(id);
    if (!rawData) {
      return Response.NOT_FOUND({ message: "Marketer Not Found" });
    }
    const marketer = await mapMarketersWithDocumentRow(rawData);

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(marketer),
    });
    return Response.SUCCESS({ data: marketer });
  } catch (error) {
    console.error("Service Error: ", error);
    throw error;
  }
};

exports.createMarketerService = async ({
  firstName,
  middleName,
  lastName,
  gender,
  dateOfBirth,
  phoneNumber,
  email,
  homeAddress,
  idDocumentType,
  idDocumentNumber,
  idDocumentFile,
  nin,
  firstEmergencyContactName,
  firstEmergencyContactNumber,
  firstEmergencyContactAddress,
  secondEmergencyContactName,
  secondEmergencyContactNumber,
  secondEmergencyContactAddress,
}) => {
  try {
    // Check if ID document file was uploaded
    if (!idDocumentFile) {
      return Response.BAD_REQUEST({
        message:
          "Please Upload Identification Document File. Expected Document Format (*.pdf, *.jpg, *.jpeg, *.png)",
      });
    }

    // Generate a UUID
    const uuid = uuidV4();

    // Generate Unique ReferralCode
    const referralCode = generateReferralCode({ firstName, lastName });

    // generate phone number verification token
    const verificationToken = generateVerificationToken();

    // generate id document uuid
    const fileName = `marketer_id_${generateFileName(idDocumentFile)}`;

    // generate email verificaiton token
    const emailToken = generateMarketerVerificaitonJwt({ sub: referralCode });

    await Promise.allSettled([
      // upload id document to cloud storage
      uploadFileToS3Bucket({
        fileName,
        buffer: idDocumentFile?.buffer,
        mimetype: idDocumentFile?.mimetype,
      }),
      // create record in database
      await createNewMarketer({
        uuid,
        referralCode,
        firstName,
        middleName,
        lastName,
        gender,
        dateOfBirth: moment(dateOfBirth).format("YYYY-MM-DD"),
        phoneNumber,
        verificationToken,
        email,
        emailToken,
        homeAddress,
        idDocumentType,
        idDocumentUuid: fileName,
        idDocumentNumber,
        nin,
        firstEmergencyContactName,
        firstEmergencyContactNumber,
        firstEmergencyContactAddress,
        secondEmergencyContactName,
        secondEmergencyContactNumber,
        secondEmergencyContactAddress,
      }),
      // Send SMS with verification token
      sendMarketerVerificationTokenSMS({
        firstName,
        token: verificationToken,
        mobileNumber: phoneNumber,
      }),

      // Send Email with verification token
      marketerEmailVerificationToken({
        firstName,
        email,
        emailToken,
      }),
    ]);

    return Response.CREATED({
      message:
        "Marketer Created Successfully. Please provide further verificaiton instructions to marketer. ",
    });
  } catch (error) {
    console.error("Service Error: ", error);
    throw error;
  }
};

exports.verifyMarketerPhoneNumberService = async (token) => {
  try {
    const marketer = await getMarketerByVerficationToken(token);
    const {
      marketer_id: marketerId,
      referral_code: referralCode,
      first_name: firstName,
      phone_number: mobileNumber,
    } = marketer;
    const verifiedAt = new Date();
    await Promise.all([
      verifyMarketerPhoneById({
        marketerId,
        phoneNumber: mobileNumber,
        verifiedAt,
      }),
      sendMarketerPhoneVerifiedSMS({
        firstName,
        mobileNumber,
        referralCode,
      }),
    ]);

    return Response.SUCCESS({
      message: "Marketer's Phone Number Verified Successfully",
    });
  } catch (error) {
    console.error("Service Error: ", error);
    throw error;
  }
};

exports.verifyMarketerEmailService = async (token) => {
  try {
    const marketer = await getMarketerByEmailVerficationToken(token);

    const { marketer_id: marketerId, email } = marketer;
    const { sub } = verifyMarketerEmailJwt(token);

    if (!sub) {
      return Response.BAD_REQUEST({
        message: "Corrupted Email Verification Token",
      });
    }

    const verifiedAt = new Date();
    await verifyMarketerEmailById({
      marketerId,
      verifiedAt,
      email,
    });

    //  TODO Send Email to marketer

    // Send Success response
    return Response.SUCCESS({
      message: "Email Verified Successfully",
    });
  } catch (error) {
    console.error("Service Error: ", error);
    if (error.message === "jwt expired") {
      throw Response.BAD_REQUEST({
        message: "Email Verification Token Expired",
      });
    }
    throw error;
  }
};

exports.updateMarketerByIdService = async ({
  marketerId,
  firstName,
  middleName,
  lastName,
  gender,
  dateOfBirth,
  phoneNumber,
  email,
  homeAddress,
  idDocumentType,
  idDocument,
  idDocumentNumber,
  nin,
  firstEmergencyContactName,
  firstEmergencyContactNumber,
  firstEmergencyContactAddress,
  secondEmergencyContactName,
  secondEmergencyContactNumber,
  secondEmergencyContacAddress,
}) => {
  try {
    const marketer = await getMarketerById(marketerId);
    if (!marketer) {
      return Response.NOT_FOUND({ message: "Marketer Not Found" });
    }

    // delete old file if a new file is sent with the update request
    if (idDocument) {
      console.log("Id document was sent ");
    }
    await updateMarketerById({
      marketerId,
      firstName,
      middleName,
      lastName,
      gender,
      dateOfBirth,
      phoneNumber,
      email,
      homeAddress,
      idDocumentType,
      idDocument,
      idDocumentNumber,
      nin,
      firstEmergencyContactName,
      firstEmergencyContactNumber,
      firstEmergencyContactAddress,
      secondEmergencyContactName,
      secondEmergencyContactNumber,
      secondEmergencyContacAddress,
    });
    return Response.SUCCESS({ message: "Successful" });
  } catch (error) {
    console.error("Service Error: ", error);
    throw error;
  }
};

exports.deleteMarketerByIdService = async (id) => {
  try {
    const marketer = await getMarketerById(id);
    if (!marketer) {
      return Response.NOT_FOUND({ message: "Marketer Not Found" });
    }
    const { id_document_uuid: idDocumentUuid } = marketer;

    await Promise.all([
      deleteFileFromS3Bucket(idDocumentUuid),
      deleteMarketerById(id),
    ]);
    return Response.SUCCESS({ message: "Marketer Deleted Successfully" });
  } catch (error) {
    console.error("Service Error: ", error);
    throw error;
  }
};
