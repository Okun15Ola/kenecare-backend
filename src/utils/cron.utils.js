const { CronJob } = require("cron");
const moment = require("moment");
const {
  getAppointments,
} = require("../repository/adminAppointments.repository");
const { generateDoctorTimeSlots } = require("./time.utils");
const logger = require("../middlewares/logger.middleware");
const { redisClient } = require("../config/redis.config");

const sendPushNotifications = (notifications) => {
  notifications.forEach(({ appointmentDateTime, diffInMinutes }) => {
    logger.info(
      `Sending push notification for appointment at ${appointmentDateTime}, ${diffInMinutes} minutes remaining.`,
    );
    // Implement push notification logic here
  });
};

const getAllAppointments = async () => {
  try {
    let appointments = null;
    const cacheKey = "appointments:all";
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      appointments = JSON.parse(cachedData);
    } else {
      const limit = 1;
      const offset = 30;
      appointments = await getAppointments(limit, offset);
      await redisClient.set({
        key: cacheKey,
        expiry: 600,
        value: JSON.stringify(appointments),
      });
    }

    const currentDateTime = moment();
    const notifications = [];
    appointments.forEach(
      ({
        appointment_status: appointmentStatus,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
      }) => {
        if (appointmentStatus !== "pending") return;

        const appointmentDateTime = moment(
          `${appointmentDate} ${appointmentTime}`,
          "YYYY-MM-DD HH:mm:ss",
        );

        if (currentDateTime.isSame(appointmentDateTime, "day")) {
          const diffInMinutes = appointmentDateTime.diff(
            currentDateTime,
            "minutes",
          );

          if (diffInMinutes === 30 || diffInMinutes === 5) {
            notifications.push({
              appointmentDateTime: appointmentDateTime.format(
                "YYYY-MM-DD HH:mm:ss",
              ),
              diffInMinutes,
            });
          }
        }
      },
    );

    // Process notifications in batch
    if (notifications.length > 0) {
      sendPushNotifications(notifications);
    }
  } catch (error) {
    logger.info(error);
    logger.error("CRON ERROR: ", error);
    throw error;
  }
};
let appointmentCronJobInstance;
let timeSlotCronInstance;

module.exports = {
  startAppointmentCron: () => {
    if (appointmentCronJobInstance) {
      logger.info("Cron job is already running...");
      console.info("Cron job is already running...");
      return;
    }

    appointmentCronJobInstance = new CronJob(
      "*/5 * * * *",
      async () => {
        try {
          logger.info("Running appointment notification cron job...");
          console.info("Running appointment notification cron job...");
          await getAllAppointments();
          logger.info("Appointment cron job completed....");
          console.info("Appointment cron job completed....");
        } catch (error) {
          logger.error("Error in cron job:", error);
        }
      },
      null, // no need for onComplete callback
      false,
      "UTC",
    );
    logger.info("Cron job started successfully");
  },

  stopAppointmentCron: () => {
    if (appointmentCronJobInstance) {
      appointmentCronJobInstance.stop();
      appointmentCronJobInstance = null;
      logger.info("Cron job stopped");
    } else {
      logger.info("No active cron job to stop");
    }
  },

  // New time slot cron functions
  startTimeSlotCron: () => {
    if (timeSlotCronInstance) {
      logger.info("Time slot cron job is already running...");
      console.info("Time slot cron job is already running...");
      return;
    }

    // Run every Sunday at 12:00 AM
    timeSlotCronInstance = new CronJob(
      "0 0 * * 0",
      async () => {
        try {
          logger.info("Running doctor time slot generation job...");
          console.info("Running doctor time slot generation job...");

          const result = await generateDoctorTimeSlots();

          if (result.success) {
            logger.info(`Time slot generation completed: ${result.message}`);
            console.info(`Time slot generation completed: ${result.message}`);
          } else {
            logger.error(`Time slot generation failed: ${result.message}`);
            console.error(`Time slot generation failed: ${result.message}`);
          }
        } catch (error) {
          logger.error("Error in time slot cron job:", error);
          console.error("Error in time slot cron job:", error);
        }
      },
      null,
      false, // prevent auto start
      "UTC",
    );

    timeSlotCronInstance.start();
    logger.info("Time slot cron job started successfully");
    console.info("Time slot cron job started successfully");
  },

  stopTimeSlotCron: () => {
    if (timeSlotCronInstance) {
      timeSlotCronInstance.stop();
      timeSlotCronInstance = null;
      logger.info("Time slot cron job stopped");
      console.info("Time slot cron job stopped");
    } else {
      logger.info("No active time slot cron job to stop");
      console.info("No active time slot cron job to stop");
    }
  },
};
