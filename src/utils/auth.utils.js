const bcryptjs = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { Expo } = require("expo-server-sdk");
const {
  patientJwtSecret,
  adminJwtSecret,
  apiClientSecret,
  jwtIssuer,
  jwtAudience,
  jwtAdminAudience,
} = require("../config/default.config");
const {
  updateUserVerificationTokenById,
} = require("../repository/users.repository");
const logger = require("../middlewares/logger.middleware");
const { redisClient } = require("../config/redis.config");
const { generateTokenExpiryTime } = require("./time.utils");
const { sendAuthTokenSMS } = require("./sms.utils");
const Response = require("./response.utils");
const { encryptionKey } = require("../config/default.config");

const SL_COUNTRY_CODE = "+232";
const MOBILE_NETWORK_CODES = [
  "25",
  "30",
  "31",
  "32",
  "33",
  "34",
  "66",
  "72",
  "73",
  "74",
  "75",
  "76",
  "77",
  "78",
  "79",
  "88",
  "90",
  "99",
];

/**
 * Hashes a user's password using bcryptjs.
 * @async
 * @param {string} password - The plain text password to hash.
 * @returns {Promise<string>} The hashed password.
 */
const hashUsersPassword = async (password) => {
  try {
    return await bcryptjs.hash(password, 10);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

/**
 * Securely encrypts a given text using AES-256-CBC.
 *
 * @param {string} text - The text to encrypt.
 * @param {string} key - A secret key (preferably 32-bytes).
 * @returns {string} The IV and encrypted text, concatenated as a single hexadecimal string.
 */
const encryptText = (text) => {
  if (!encryptionKey) {
    throw new Error("Encryption key not found");
  }
  // Use a secure key derivation function to generate a 32-byte key from the provided secret.
  const derivedKey = crypto.scryptSync(encryptionKey, "salt", 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", derivedKey, iv);
  let encryptedText = cipher.update(text, "utf8", "hex");
  encryptedText += cipher.final("hex");
  return `${iv.toString("hex")}:${encryptedText}`;
};

/**
 * Securely decrypts an encrypted text using AES-256-CBC.
 *
 * @param {string} text - The IV and encrypted text, concatenated as a single hexadecimal string.
 * @param {string} key - A secret key.
 * @returns {string} The decrypted plain text.
 */
const decryptText = (text) => {
  if (!encryptionKey) {
    throw new Error("Encryption key not found");
  }
  const [ivHex, encryptedText] = text.split(":");
  if (!ivHex || !encryptedText) {
    console.log("Invalid encrypted data format.");
  }
  const derivedKey = crypto.scryptSync(encryptionKey, "salt", 32);
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", derivedKey, iv);
  let decryptedText = decipher.update(encryptedText, "hex", "utf8");
  decryptedText += decipher.final("utf8");
  return decryptedText;
};

/**
 * Compares a plain password with a hashed password.
 * @async
 * @param {Object} params
 * @param {string} params.plainPassword - The plain text password.
 * @param {string} params.hashedPassword - The hashed password.
 * @returns {Promise<boolean>} True if passwords match, false otherwise.
 */
const comparePassword = async ({ plainPassword, hashedPassword }) => {
  try {
    return await bcryptjs.compare(plainPassword, hashedPassword);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

/**
 * Blacklist a JWT token until its natural expiration
 * @param {string} token - JWT token to blacklist
 * @param {number} expiryTime - Token expiry time (Unix timestamp)
 */
const blacklistToken = async (token, expiryTime) => {
  try {
    const currentTime = Math.floor(Date.now() / 1000);
    const ttl = expiryTime - currentTime;

    // Only blacklist if token hasn't expired
    if (ttl > 0) {
      await redisClient.set({
        key: `blacklist:${token}`,
        value: "true",
        expiry: ttl, // TTL in seconds
      });
    }
  } catch (error) {
    logger.error("blacklistToken:", error);
  }
};

/**
 * Blacklists all tokens for a user by setting an invalidation flag.
 * @async
 * @param {number} userId - User ID.
 * @returns {Promise<void>}
 */
const blacklistAllUserTokens = async (userId) => {
  try {
    // Set a flag to invalidate all tokens issued before this time
    await redisClient.set({
      key: `user:${userId}:token_invalidate_time`,
      value: Math.floor(Date.now() / 1000).toString(),
      ttl: 86400 * 7, // 7 days
    });
  } catch (error) {
    logger.error("blacklistAllUserTokens:", error);
  }
};

/**
 * Checks if a token is blacklisted.
 * @async
 * @param {string} token - JWT token to check.
 * @returns {Promise<boolean>} True if blacklisted, false otherwise.
 */
const isTokenBlacklisted = async (token) => {
  try {
    const blacklisted = await redisClient.get(`blacklist:${token}`);
    return !!blacklisted;
  } catch (error) {
    logger.error("isTokenBlacklisted:", error);
    return false;
  }
};

/**
 * Checks if user tokens are invalidated based on issued time.
 * @async
 * @param {number} userId - User ID.
 * @param {number} tokenIssuedAt - Token issued at timestamp.
 * @returns {Promise<boolean>} True if invalidated, false otherwise.
 */
const areUserTokensInvalidated = async (userId, tokenIssuedAt) => {
  try {
    const invalidateTime = await redisClient.get(
      `user:${userId}:token_invalidate_time`,
    );
    if (!invalidateTime) return false;

    return parseInt(invalidateTime, 10) > tokenIssuedAt;
  } catch (error) {
    logger.error("areUserTokensInvalidated:", error);
    return false;
  }
};

/**
 * Generates a JWT access token for a user.
 * @param {Object} user - The user payload to encode in the token.
 * @returns {string} The signed JWT token.
 */
const generateUsersJwtAccessToken = (user) => {
  try {
    return jwt.sign(user, patientJwtSecret, {
      issuer: jwtIssuer,
      audience: jwtAudience,
      expiresIn: "1d",
    });
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

/**
 * Generates a JWT access token for an admin.
 * @param {Object} admin - The admin payload to encode in the token.
 * @returns {string} The signed JWT token.
 */
const generateAdminJwtAccessToken = (admin) => {
  try {
    return jwt.sign(admin, adminJwtSecret, {
      issuer: jwtIssuer,
      audience: jwtAdminAudience,
      expiresIn: "1d",
    });
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const generateApiClientJwtAccessToken = (api) => {
  try {
    return jwt.sign(api, apiClientSecret, {
      issuer: jwtIssuer,
      audience: jwtAdminAudience,
      expiresIn: "30d",
    });
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

/**
 * Generates a secure random refresh token
 * @returns {string} A random string to use as refresh token
 */
const generateRefreshToken = () => {
  return crypto.randomBytes(40).toString("hex");
};

/**
 * Generates a JWT verification token for a marketer.
 * @param {Object} marketer - The marketer payload to encode in the token.
 * @returns {string} The signed JWT token.
 */
const generateMarketerVerificaitonJwt = (marketer) => {
  try {
    return jwt.sign(marketer, adminJwtSecret, {
      issuer: jwtIssuer,
      audience: jwtAdminAudience,
      expiresIn: "1h",
    });
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

/**
 * Verifies a marketer email JWT token.
 * @param {string} token - The JWT token to verify.
 * @returns {Object} The decoded token payload.
 * @throws {Error} If verification fails.
 */
const verifyMarketerEmailJwt = (token) => {
  try {
    return jwt.verify(token, adminJwtSecret, {
      issuer: jwtIssuer,
      audience: jwtAdminAudience,
    });
  } catch (error) {
    logger.error(error.message);
    throw new Error(error.message);
  }
};

/**
 * Generates a random 6-digit verification token.
 * @returns {string} A 6-digit verification token as a string.
 */
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

/**
 * Generates and sends a verification OTP to a user's mobile number.
 * @async
 * @param {Object} params
 * @param {number} params.userId - The user's ID.
 * @param {string} params.mobileNumber - The user's mobile number.
 * @returns {Promise<Object>} Response object indicating success or failure.
 */
const generateAndSendVerificationOTP = async ({ userId, mobileNumber }) => {
  const token = generateVerificationToken();
  const tokenExpiry = generateTokenExpiryTime(15);
  const [updateResult, smsResult] = await Promise.allSettled([
    updateUserVerificationTokenById({
      userId,
      token,
      tokenExpiry,
    }),
    sendAuthTokenSMS({
      token,
      mobileNumber,
    }),
  ]);

  if (updateResult.status === "rejected" || smsResult.status === "rejected") {
    return Response.INTERNAL_SERVER_ERROR({
      message: "Error sending verification code. Please try again.",
    });
  }

  return Response.SUCCESS({ message: "Verification OTP sent successfully" });
};

/**
 * Validates if a token is a valid Expo push token.
 * @param {string} token - The Expo push token to validate.
 * @returns {boolean} True if valid, false otherwise.
 */
const validateExpoToken = (token) => {
  return Expo.isExpoPushToken(token);
};

/**
 * Refines and validates a Sierra Leone mobile number.
 * @param {string} mobileNumber - The mobile number to refine.
 * @returns {string} The normalized mobile number with country code.
 * @throws {Error} If the mobile number is invalid.
 */
const refineMobileNumber = (mobileNumber) => {
  if (!mobileNumber) throw new Error("Mobile Number is required");
  const normalized = mobileNumber.replace(/^(\+232|00232|0|232)/, "");
  if (!/^\d{8}$/.test(normalized))
    throw new Error("Invalid Sierra Leone Phone Number");
  const prefix = normalized.slice(0, 2);
  if (!MOBILE_NETWORK_CODES.includes(prefix))
    throw new Error("Invalid Sierra Leone Mobile Network Code");
  return `${SL_COUNTRY_CODE}${normalized}`;
};

const getKeyPrefix = (env) => {
  const keyPrefix = {
    production: "KC_LIVE_",
    development: "KC_DEV_",
    staging: "KC_STAGE_",
    test: "KC_TEST_",
  };

  let prefix = null;
  switch (env) {
    case "development":
      prefix = keyPrefix.development;
      break;
    case "production":
      prefix = keyPrefix.production;
      break;
    case "staging":
      prefix = keyPrefix.staging;
      break;
    default:
      prefix = keyPrefix.test;
  }
  return prefix;
};

const generateApiKeyAndSecret = async (env) => {
  const environmentPrefix = getKeyPrefix(env);
  const randomPart = crypto.randomBytes(16).toString("hex");
  const apiSecret = crypto.randomBytes(64).toString("hex");
  const hashedApiSecret = await bcryptjs.hash(apiSecret, 10);
  const apiKey = `${environmentPrefix}${randomPart}`;
  return { apiKey, apiSecret, hashedApiSecret };
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
  blacklistToken,
  blacklistAllUserTokens,
  isTokenBlacklisted,
  areUserTokensInvalidated,
  getKeyPrefix,
  generateApiKeyAndSecret,
  generateApiClientJwtAccessToken,
  generateRefreshToken,
};
