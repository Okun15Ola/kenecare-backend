// const nodemailer = require("nodemailer");

// // Create a transporter object with your SMTP details
// const transporter = nodemailer.createTransport({
//   host: "smtp.ethereal.email",
//   port: 587,
//   auth: {
//     user: "reymundo.bins@ethereal.email",
//     pass: "hg2W2jR8gCVA3tvd7c",
//   },
// });

// // Immediately Invoked Function Expression to run the async logic
// (async () => {
//   try {
//     // 1. Verify the transporter connection
//     await transporter.verify();
//     console.log("Transporter verified. Connection is ready.");

//     // 2. Define mail options
//     const mailOptions = {
//       from: '"Sender" <reymundo.bins@ethereal.email>',
//       to: "mevizdaven@gmail.com",
//       subject: "Test Email",
//       text: "This is a simple test email.",
//       html: "<b>This is a simple test email.</b>",
//     };

//     // 3. Send the email
//     const info = await transporter.sendMail(mailOptions);
//     console.log(`Email sent successfully. Message ID: ${info.messageId}`);
//   } catch (error) {
//     console.error("An error occurred:", error);
//   } finally {
//     // 4. Close the transporter
//     transporter.close();
//   }
// })();
