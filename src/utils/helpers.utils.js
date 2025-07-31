// const moment = require("moment");
const { body } = require("express-validator");
const { USERTYPE } = require("./enum.utils");
const { createOrUpdateStreamUser } = require("./stream.utils");
const { getPatientByUserId } = require("../repository/patients.repository");
const { getFileUrlFromS3Bucket } = require("./aws-s3.utils");
const { getDoctorByUserId } = require("../repository/doctors.repository");
// const {
//   getAvailableDoctors,
// } = require("../repository/doctorAvailableDays.repository");
const logger = require("../middlewares/logger.middleware");
/**
 * Creates or updates a Stream user profile for a given user type and user ID.
 * Fetches user details (patient or doctor), retrieves the profile image URL from S3 if available,
 * and then creates or updates the user profile in the Stream service.
 *
 * @async
 * @function createStreamUserProfile
 * @param {string} userType - The type of user (e.g., USERTYPE.PATIENT or USERTYPE.DOCTOR).
 * @param {number} userId - The unique identifier of the user.
 * @returns {Promise<void>} Resolves when the operation is complete.
 */
const createStreamUserProfile = async (userType, userId) => {
  if (![USERTYPE.PATIENT, USERTYPE.DOCTOR].includes(userType)) return;
  try {
    const fetchUserDetails =
      userType === USERTYPE.PATIENT ? getPatientByUserId : getDoctorByUserId;
    const userDetails = await fetchUserDetails(userId);
    if (!userDetails) return;
    const {
      first_name: firstName,
      last_name: lastName,
      profile_pic_url: profilePicUrl,
      mobile_number: mobileNumber,
    } = userDetails;
    const imageUrl = profilePicUrl
      ? await getFileUrlFromS3Bucket(profilePicUrl)
      : null;
    await createOrUpdateStreamUser({
      userId: String(userId),
      mobileNumber,
      userType,
      username: `${firstName ?? ""} ${lastName ?? ""}`.trim(),
      image: imageUrl,
    });
  } catch (err) {
    logger.error("createStreamUserProfile:", err);
  }
};

/**
 * Validator for boolean fields that accepts true/false, 0/1, '0'/'1'
 * but normalizes to 0/1 format for MySQL storage
 *
 * @param {string} fieldName - Name of the field to validate
 * @param {string} [message] - Custom error message
 * @returns {Object} Express validator chain
 */
const binaryBooleanValidator = (
  fieldName,
  message = "Field must be a boolean value (true/false or 0/1)",
) => {
  return body(fieldName)
    .optional()
    .custom((value) => {
      // Accept true/false, 0/1, '0'/'1' as valid values
      return (
        value === true ||
        value === false ||
        value === 0 ||
        value === 1 ||
        value === "0" ||
        value === "1"
      );
    })
    .withMessage(message)
    .customSanitizer((value) => {
      // Normalize to 0/1 for database
      if (value === true || value === 1 || value === "1") {
        return 1;
      }
      return 0;
    });
};

module.exports = {
  createStreamUserProfile,
  binaryBooleanValidator,
};
