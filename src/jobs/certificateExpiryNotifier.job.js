/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
const moment = require("moment");
const councilRepository = require("../repository/medical-councils.repository");
const logger = require("../middlewares/logger.middleware");
const smsUtils = require("../utils/sms.utils");

const NOTIFICATION_TYPES = {
  SEVEN_DAYS: "7_DAYS_REMINDER",
  TWO_DAYS: "2_DAYS_REMINDER",
  EXPIRED: "EXPIRED_REMINDER",
};

const SMS_MESSAGES = {
  SEVEN_DAYS: (doctorName, expiryDate) =>
    `Dear Dr. ${doctorName}\n\n, your medical council certificate will expire in 7 days on ${expiryDate}. Please renew it to avoid service interruption.\n\n\nKENECARE TEAM.`,
  TWO_DAYS: (doctorName, expiryDate) =>
    `URGENT: Dr. ${doctorName}\n\n, your medical council certificate will expire in 2 days on ${expiryDate}. Renew now!\n\n\nKENECARE TEAM.`,
  EXPIRED: (doctorName, expiryDate) =>
    `ACTION REQUIRED: Dr. ${doctorName},\n\n your medical council certificate expired today, ${expiryDate}. Please renew immediately.\n\n\nKENECARE TEAM.`,
};

/**
 * Sends an SMS notification to a doctor about their certificate expiry.
 *
 * @param {object} doctor The doctor's details (e.g., firstName, lastName, mobileNumber).
 * @param {string} expiryDateFormatted The formatted expiry date.
 * @param {string} notificationType The type of notification (e.g., '7_DAYS_REMINDER').
 * @param {number} councilRegistrationId The ID of the certificate registration.
 */
async function sendCertificateExpirySms(
  doctor,
  expiryDateFormatted,
  notificationType,
) {
  const doctorName = `DR. ${doctor.last_name}`;
  const mobileNumber = doctor.mobile_number;
  const message = SMS_MESSAGES[notificationType](
    doctorName,
    expiryDateFormatted,
  );

  if (!mobileNumber) {
    logger.warn(
      `SMS not sent for doctor ${doctor.doctor_id} (${doctorName}): No mobile number found.`,
    );
    return;
  }

  try {
    await smsUtils.sendCertificateExpirySms({
      mobileNumber,
      message,
    });
  } catch (error) {
    logger.error(
      `Failed to send SMS for certificate expiry (${notificationType}) to doctor ${doctor.doctor_id} (${doctorName}):`,
      error,
    );
  }
}

module.exports = {
  schedule: "0 8 * * *", // every day at 08:00"
  name: "certificateExpiryNotifications",

  async execute() {
    const today = moment().startOf("day");
    try {
      logger.info("Running certificate expiry notification cron job...");
      console.info("Running certificate expiry notification cron job...");

      const doctorsWithCertificates =
        await councilRepository.getAllActiveDoctorRegistrationsWithDoctorDetails();

      for (const registration of doctorsWithCertificates) {
        const expiryDate = moment(registration.certificate_expiry_date).startOf(
          "day",
        );
        const daysUntilExpiry = expiryDate.diff(today, "days");

        const expiryDateFormatted = expiryDate.format("YYYY-MM-DD");

        // Case 1: 7 days before expiry
        if (daysUntilExpiry === 7) {
          await sendCertificateExpirySms(
            registration,
            expiryDateFormatted,
            NOTIFICATION_TYPES.SEVEN_DAYS,
          );
        }
        // Case 2: 2 days before expiry
        else if (daysUntilExpiry === 2) {
          await sendCertificateExpirySms(
            registration,
            expiryDateFormatted,
            NOTIFICATION_TYPES.TWO_DAYS,
          );
        }
        // Case 3: On the day of expiry
        else if (daysUntilExpiry === 0) {
          await sendCertificateExpirySms(
            registration,
            expiryDateFormatted,
            NOTIFICATION_TYPES.EXPIRED,
          );
        }
      }
      logger.info("Certificate expiry notification cron job finished.");
      console.info("Certificate expiry notification cron job finished.");
    } catch (error) {
      logger.error("Error in certificate expiry notification job:", error);
      console.error("Error in certificate expiry notification job:", error);
    }
  },
};
