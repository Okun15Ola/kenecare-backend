/* eslint-disable no-unused-vars */
// eslint-disable-next-line import/no-extraneous-dependencies
const { Expo } = require("expo-server-sdk");
const axios = require("axios");
const logger = require("../middlewares/logger.middleware");

const expo = new Expo({ useFcmV1: true });

const axiosConfig = {
  method: "POST",
  url: "https://exp.host/--/api/v2/push/send",
  headers: {
    Accept: "application/json",
    "Accept-encoding": "gzip, deflate",
    "Content-Type": "application/json",
  },
};
const sendPushNotifications = async ({ tokens, data }) => {
  try {
    const { body } = data;

    const messages = tokens.map((token) => {
      return {
        to: token,
        sound: "default",
        body,
        data,
      };
    });

    const chunks = expo.chunkPushNotifications(messages);
    let tickets = [];
    (async () => {
      tickets = chunks.map(async (chunk) => {
        try {
          return await expo.sendPushNotificationsAsync(chunk);
        } catch (error) {
          logger.error(error);
          throw error;
        }
      });
    })();

    const receiptIds = tickets
      .filter((ticket) => ticket.status === "ok")
      .map((ticket) => ticket.id);

    const receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);

    const processReceipts = async (chunk) => {
      try {
        const receipts = await expo.getPushNotificationReceiptsAsync(chunk);
        logger.info(receipts);
        receipts
          .filter((receipt) => receipt.status !== "ok")
          .forEach((receipt) => {
            if (receipt.staus === "error") {
              logger.error("ERROR");
              if (receipt.details?.error) {
                logger.error(`The error code is ${receipt.details.error}`);
              }
            }
          });
        // Iterate over the entries of the receipts object
      } catch (error) {
        logger.error(error);
        throw error;
      }
    };
    (async () => {
      try {
        const promises = receiptIdChunks.map((chunk) => processReceipts(chunk));
        await Promise.all(promises);
      } catch (error) {
        logger.error(error);
      }
    })();
  } catch (error) {
    logger.info(error);
  }
};

const sendPushNotification = async (notification) => {
  try {
    const { token, title, body, payload } = notification;
    if (!Expo.isExpoPushToken(token)) return null;
    const message = {
      to: token,
      sound: "default",
      title,
      body,
      data: payload,
    };

    return await expo.sendPushNotificationsAsync([message]);
  } catch (error) {
    logger.info("Error Sending Push Notification: ", error);
    logger.error(error);
    throw error;
  }
};

// (async () => {
//   const token = "ExponentPushToken[WKJu10OpuUwIMEU1f7JTma]";
//   const notification = {
//     token,
//     title: "New Patient Appointment",
//     body: "Chinedum booked an appointment.",
//     payload: {
//       appointmentId: 1,
//       appointmentDate: "2024-15-06",
//     },
//   };
//   // const response = await sendPushNotification(notification);
//   // logger.info(response);
// })();

module.exports = {
  sendPushNotifications,
  sendPushNotification,
};
