const { CronJob } = require("cron");
const logger = require("../middlewares/logger.middleware");
const appointmentNotifier = require("../jobs/appointmentNotifier.job");
// const timeSlotGenerator = require("../jobs/timeSlotGenerator.job");
const autoEndAppointment = require("../jobs/autoEndAppointment.job");
const blogPublisher = require("../jobs/blogPublisher.job");
const dailyPendingAppointment = require("../jobs/pendingAppointmentsNotifier.job");
const dailyApprovedAppointment = require("../jobs/upcomingAppointmentNotifier.job");
const userOnlineStatus = require("../jobs/markUserOfflineIfInactive.job");
const certificateExpiryNotifier = require("../jobs/certificateExpiryNotifier.job");

// Track job instances
const jobInstances = {};

// Create start and stop functions for a job
const createJobFunctions = (jobModule) => {
  const { name, schedule, execute } = jobModule;

  const start = () => {
    if (jobInstances[name]) {
      logger.info(`${name} job is already running...`);
      console.info(`${name} job is already running...`);
      return;
    }

    jobInstances[name] = new CronJob(schedule, execute, null, false, "UTC");

    jobInstances[name].start();
    logger.info(`${name} job started successfully`);
    console.info(`${name} job started successfully`);
  };

  const stop = () => {
    if (jobInstances[name]) {
      jobInstances[name].stop();
      jobInstances[name] = null;
      logger.info(`${name} job stopped`);
      console.info(`${name} job stopped`);
    } else {
      logger.info(`No active ${name} job to stop`);
      console.info(`No active ${name} job to stop`);
    }
  };

  return { start, stop };
};

// Create functions for each job
const appointmentFunctions = createJobFunctions(appointmentNotifier);
// const timeSlotFunctions = createJobFunctions(timeSlotGenerator);
const autoEndFunctions = createJobFunctions(autoEndAppointment);
const blogPublishingFunctions = createJobFunctions(blogPublisher);
const dailyPendingAppointmentFunctions = createJobFunctions(
  dailyPendingAppointment,
);
const dailyApprovedAppointmentFunctions = createJobFunctions(
  dailyApprovedAppointment,
);
const userOnlineStatusFunctions = createJobFunctions(userOnlineStatus);
const certificateExpiryFunctions = createJobFunctions(
  certificateExpiryNotifier,
);

module.exports = {
  startAppointmentCron: appointmentFunctions.start,
  stopAppointmentCron: appointmentFunctions.stop,

  // startTimeSlotCron: timeSlotFunctions.start,
  // stopTimeSlotCron: timeSlotFunctions.stop,

  startAutoEndAppointmentCron: autoEndFunctions.start,
  stopAutoEndAppointmentCron: autoEndFunctions.stop,

  startBlogPublishingCron: blogPublishingFunctions.start,
  stopBlogPublishingCron: blogPublishingFunctions.stop,

  startPendingAppointmentCron: dailyPendingAppointmentFunctions.start,
  stopPendingAppointmentCron: dailyPendingAppointmentFunctions.stop,

  startApprovedAppointmentCron: dailyApprovedAppointmentFunctions.start,
  stopApprovedAppointmentCron: dailyApprovedAppointmentFunctions.stop,

  startUserOnlineStatusCron: userOnlineStatusFunctions.start,
  stopUserOnlineStatusCron: userOnlineStatusFunctions.stop,

  startRegistrationCertificateExpiryCron: certificateExpiryFunctions.start,
  stopRegistrationCertificateExpiryCron: certificateExpiryFunctions.stop,

  startAllCronJobs: () => {
    appointmentFunctions.start();
    // timeSlotFunctions.start();
    autoEndFunctions.start();
    blogPublishingFunctions.start();
    dailyPendingAppointmentFunctions.start();
    dailyApprovedAppointmentFunctions.start();
    userOnlineStatusFunctions.start();
    certificateExpiryFunctions.start();
  },

  stopAllCronJobs: () => {
    appointmentFunctions.stop();
    // timeSlotFunctions.stop();
    autoEndFunctions.stop();
    blogPublishingFunctions.stop();
    dailyPendingAppointmentFunctions.stop();
    dailyApprovedAppointmentFunctions.stop();
    userOnlineStatusFunctions.stop();
    certificateExpiryFunctions.stop();
  },
};
