const { CronJob } = require("cron");
const moment = require("moment");
const { getAppointments } = require("../db/db.appointments.admin");
const logger = require("../middlewares/logger.middleware");

const getAllAppointments = async () => {
  try {
    const appointments = await getAppointments();

    appointments
      .filter(
        ({ appointment_status: appointmentStatus }) =>
          appointmentStatus === "pending",
      )
      .forEach(
        ({
          appointment_date: appointmentDate,
          appointment_time: appointmentTime,
        }) => {
          const formattedAppointmentDate =
            moment(appointmentDate).format("YYYY-MM-DD");

          const appointmentDateTime = moment(
            `${formattedAppointmentDate} ${appointmentTime}`,
            "YYYY-MM-DD HH:mm:ss",
          );

          const currentDateTime = moment();

          const isSameDate = currentDateTime.isSame(appointmentDateTime, "day");

          if (isSameDate) {
            const diffInMinutes = appointmentDateTime.diff(
              currentDateTime,
              "minutes",
            );

            if (diffInMinutes > 0 && diffInMinutes === 30) {
              // TODO Send push notification
            }
            if (diffInMinutes > 0 && diffInMinutes === 5) {
              // TODO Send push notification
            }
          }
        },
      );
  } catch (error) {
    console.log(error);
    logger.error("CRON ERROR: ", error);
    throw error;
  }
};

module.exports = {
  runCron: () => {
    // 5 MINUTES TO APPOINTMENT CRON JOB
    CronJob.from({
      cronTime: "*/1 * * * *",
      // eslint-disable-next-line func-names
      onTick() {
        getAllAppointments();
      },
      start: true,
      timeZone: "utc",
    });
  },
};
