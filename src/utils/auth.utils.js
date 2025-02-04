// const he = require("he");
const bcryptjs = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { Expo } = require("expo-server-sdk");
const {
  patientJwtSecret,
  adminJwtSecret,
  jwtIssuer,
  jwtAudience,
  jwtAdminAudience,
} = require("../config/default.config");
const { updateUserVerificationTokenById } = require("../db/db.users");

const { sendAuthTokenSMS } = require("./sms.utils");
const Response = require("./response.utils");

const SL_COUNTRY_CODE = "+232";

const hashUsersPassword = async (password) => {
  try {
    return await bcryptjs.hash(password, 10);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const encryptText = (text, key) => {
  const cipher = crypto.createCipher("aes-256-cbc", key);
  let encryptedText = cipher.update(text, "utf8", "hex");
  encryptedText += cipher.final("hex");
  return encryptedText;
};

const decryptText = ({ encryptedText, key }) => {
  const decipher = crypto.createDecipher("aes-256-cbc", key);
  let decryptedText = decipher.update(encryptedText, "hex", "utf8");
  decryptedText += decipher.final("utf8");
  return decryptedText;
};

const comparePassword = async ({ plainPassword, hashedPassword }) => {
  try {
    return await bcryptjs.compare(plainPassword, hashedPassword);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const generateUsersJwtAccessToken = (user) => {
  try {
    return jwt.sign(user, patientJwtSecret, {
      issuer: jwtIssuer,
      audience: jwtAudience,
      expiresIn: "1d",
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
const generateAdminJwtAccessToken = (admin) => {
  try {
    return jwt.sign(admin, adminJwtSecret, {
      issuer: jwtIssuer,
      audience: jwtAdminAudience,
      expiresIn: "1d",
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const generateMarketerVerificaitonJwt = (marketer) => {
  try {
    return jwt.sign(marketer, adminJwtSecret, {
      issuer: jwtIssuer,
      audience: jwtAdminAudience,
      expiresIn: "1h",
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const verifyMarketerEmailJwt = (token) => {
  try {
    return jwt.verify(token, adminJwtSecret, {
      issuer: jwtIssuer,
      audience: jwtAdminAudience,
    });
  } catch (error) {
    console.error(error.message);
    throw new Error(error.message);
  }
};

const generateVerificationToken = () => {
  // Generate a random 3-byte (6-digit) hexadecimal number
  const randomBytes = crypto.randomBytes(3);
  const randomHex = randomBytes.toString("hex");

  // Convert the hexadecimal number to decimal
  const randomDecimal = parseInt(randomHex, 16);

  // Ensure the number is six digits by taking the remainder when divided by 1,000,000
  const sixDigitNumber = randomDecimal % 1000000;

  // Ensure leading zeros are included if needed
  const formattedSixDigitNumber = String(sixDigitNumber).padStart(6, "0");

  return formattedSixDigitNumber;
};

const generateAndSendVerificationOTP = async ({ userId, mobileNumber }) => {
  const token = generateVerificationToken();
  await Promise.all([
    updateUserVerificationTokenById({
      userId,
      token,
    }),
    sendAuthTokenSMS({
      token,
      mobileNumber,
    }),
  ]);

  return Response.SUCCESS({ message: "Verification OTP sent succesfully" });
};

const validateExpoToken = (token) => {
  return Expo.isExpoPushToken(token);
};

const refineMobileNumber = (mobileNumber) => {
  if (!mobileNumber) return null;
  const slicedMobileNumber = mobileNumber.slice(-8);
  return `${SL_COUNTRY_CODE}${slicedMobileNumber}`;
};

module.exports = {
  hashUsersPassword,
  comparePassword,
  generateVerificationToken,
  generateUsersJwtAccessToken,
  generateAdminJwtAccessToken,
  encryptText,
  decryptText,
  validateExpoToken,
  generateMarketerVerificaitonJwt,
  verifyMarketerEmailJwt,
  refineMobileNumber,
  generateAndSendVerificationOTP,
};
