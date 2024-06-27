/* eslint-disable no-unused-vars */
// eslint-disable-next-line import/no-extraneous-dependencies
const { Expo } = require("expo-server-sdk");
const axios = require("axios");

const expo = new Expo({ useFcmV1: false });
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
          console.error(error);
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
        console.log(receipts);
        receipts
          .filter((receipt) => receipt.status !== "ok")
          .forEach((receipt) => {
            if (receipt.staus === "error") {
              console.error("ERROR");
              if (receipt.details && receipt.details.error) {
                console.error(`The error code is ${receipt.details.error}`);
              }
            }
          });
        // Iterate over the entries of the receipts object
      } catch (error) {
        console.error(error);
        throw error;
      }
    };
    (async () => {
      try {
        const promises = receiptIdChunks.map((chunk) => processReceipts(chunk));
        await Promise.all(promises);
      } catch (error) {
        console.error(error);
      }
    })();
  } catch (error) {
    console.log(error);
  }
};

// const sendPushNotification = async (token) => {
//   try {
//     const message = {
//       to: token,
//       sound: "default",
//       title: "Hello World!",
//       body: "And this is the awesome body",
//       data: { test: "Test Data" },
//     };

//     axiosConfig.data = message;
//     const { data } = await axios.request(axiosConfig).catch((error) => {
//       console.error(error);
//       throw error;
//     });

//     console.log(data);

//     //  await axios.post("https://exp.host/--/api/v2/push/send", {
//     //    headers: {
//     //      Accept: "application/json",
//     //      "Accept-encoding": "gzip, deflate",
//     //      "Content-Type": "application/json",
//     //    },
//     //    body: JSON.stringify(message),
//     //  });
//   } catch (error) {
//     console.log("Error Sending Push Notification: ", error);
//   }
// };
// const tokens = ["ExponentPushToken[WKJu10OpuUwIMEU1f7JTma]"];
// const token = "ExponentPushToken[WKJu10OpuUwIMEU1f7JTma]";

// const data = {
//   body: "Testing from Kenecare Server",
// };

// (async () => {
//   await sendPushNotification(token);
// })();

module.exports = {
  sendPushNotifications,
};
