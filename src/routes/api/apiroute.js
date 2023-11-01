const express = require("express");

const LoginController = require("../../controllers/api/LoginController.js");
const RegisterController = require("../../controllers/api/RegisterController.js");
const ChangepasswordController = require("../../controllers/api/ChangepasswordController.js");
const ProfileController = require("../../controllers/api/ProfileController.js");
const AppointmentController = require("../../controllers/api/AppointmentController.js");
const CityController = require("../../controllers/api/CityController.js");
const TestimonialController = require("../../controllers/api/TestimonialController.js");
const Section1Controller = require("../../controllers/api/Section1Controller.js");
const BlogController = require("../../controllers/api/BlogController.js");
const SpecializationController = require("../../controllers/api/SpecializationController.js");
const RegistrationcouncilController = require("../../controllers/api/RegistrationcouncilController.js");
const DegreeController = require("../../controllers/api/DegreeController.js");
const VideoConsultantController = require("../../controllers/api/VideoConsultantController.js");
const DepartmentTypeController = require("../../controllers/api/DepartmentTypeController.js");
const FeedbackController = require("../../controllers/api/FeedbackController.js");
const PaymentController = require("../../controllers/api/PaymentController.js");
const NotificationController = require("../../controllers/api/NotificationController.js");
const DocumentController = require("../../controllers/api/DocumentController.js");
const RevenueController = require("../../controllers/api/RevenueController.js");

const { verifyToken } = require("../../config/auth.jwt");

const apiRoute = express.Router();

apiRoute.post("/login", LoginController.login);
apiRoute.post("/doctor_login", LoginController.doctor_login);
apiRoute.post("/login_otp", LoginController.login_otp);
apiRoute.post("/register", RegisterController.register);
apiRoute.post("/doctor_register", RegisterController.doctor_register);
apiRoute.post("/register_mobile_chk", RegisterController.register_mobile_chk);
apiRoute.post(
  "/register_data_chk_doc",
  RegisterController.register_data_chk_doc
);
apiRoute.post(
  "/change_password",
  verifyToken,
  ChangepasswordController.change_password
);


apiRoute.post(
  "/get_user_profile",
  verifyToken,
  ProfileController.get_user_profile
);
apiRoute.post(
  "/edit_user_profile",
  verifyToken,
  ProfileController.edit_user_profile
);

apiRoute.post(
  "/edit_patient_profile",
  verifyToken,
  ProfileController.edit_patient_profile
);

apiRoute.post(
  "/get_patient_docs",
  verifyToken,
  ProfileController.get_patient_docs
);
apiRoute.post(
  "/edit_patient_profile_docs",
  verifyToken,
  ProfileController.edit_patient_profile_docs
);

apiRoute.post(
  "/get_doctor_profile",
  verifyToken,
  ProfileController.get_doctor_profile
);
apiRoute.post(
  "/edit_doctor_profile",
  verifyToken,
  ProfileController.edit_doctor_profile
);
apiRoute.post(
  "/doctor_profile_verification",
  verifyToken,
  ProfileController.doctor_profile_verification
);
apiRoute.post(
  "/get_doctor_profile_verification",
  verifyToken,
  ProfileController.get_doctor_profile_verification
);
apiRoute.post(
  "/save_mr_otp_data",
  verifyToken,
  ProfileController.save_mr_otp_data
);
apiRoute.post(
  "/delete_doctor_profile_docs",
  verifyToken,
  ProfileController.delete_doctor_profile_docs
);

apiRoute.post("/appointment", verifyToken, AppointmentController.appointment);
apiRoute.post(
  "/edit_appointment",
  verifyToken,
  AppointmentController.edit_appointment
);
apiRoute.post(
  "/update_appointment_status",
  verifyToken,
  AppointmentController.update_appointment_status
);

apiRoute.post("/city", CityController.city);
apiRoute.post("/testimonial", TestimonialController.testimonial);
apiRoute.post("/section1", Section1Controller.section1);
apiRoute.post("/department_types", DepartmentTypeController.department_types);

apiRoute.get("/blog", BlogController.blog);
apiRoute.post("/blog_detail", BlogController.blog_detail);

apiRoute.post("/specialization", SpecializationController.specialization);
apiRoute.post(
  "/registration_council",
  RegistrationcouncilController.registration_council
);
apiRoute.post("/degree", DegreeController.degree);

apiRoute.post(
  "/getAllocatedSpecialties",
  SpecializationController.getAllocatedSpecialties
);
apiRoute.post(
  "/getDoctorsBySpecialty",
  SpecializationController.getDoctorsBySpecialty
);
apiRoute.post(
  "/checkDoctorAppointments",
  AppointmentController.checkDoctorAppointments
);
apiRoute.post("/getDoctorDetails", ProfileController.getDoctorDetails);
apiRoute.post("/getDoctorSlots", ProfileController.getDoctorSlots);
apiRoute.post("/getAppointments", AppointmentController.getAppointments);
apiRoute.post("/getDoctorsByLocation", ProfileController.getDoctorsByLocation);
apiRoute.post(
  "/getMonthWiseAppointmentsCount",
  AppointmentController.getMonthWiseAppointmentsCount
);

// Video Consultant
apiRoute.post(
  "/saveVideoConsultantData",
  verifyToken,
  VideoConsultantController.saveVideoConsultantData
);
apiRoute.post(
  "/getVideoConsultantData",
  verifyToken,
  VideoConsultantController.getVideoConsultantData
);
apiRoute.post(
  "/addPrescription",
  verifyToken,
  VideoConsultantController.addPrescription
);
apiRoute.post(
  "/getPrescription",
  verifyToken,
  VideoConsultantController.getPrescription
);
apiRoute.post(
  "/deletePrescription",
  verifyToken,
  VideoConsultantController.deletePrescription
);

// Chat
apiRoute.post("/send_msg", verifyToken, VideoConsultantController.send_msg);
apiRoute.post(
  "/getlive_message",
  verifyToken,
  VideoConsultantController.getlive_message
);
apiRoute.post(
  "/getall_message",
  verifyToken,
  VideoConsultantController.getall_message
);
apiRoute.post(
  "/get_unread_message_count",
  verifyToken,
  VideoConsultantController.get_unread_message_count
);

// Zoom
apiRoute.post(
  "/generateSignature",
  verifyToken,
  VideoConsultantController.generateSignature
);
apiRoute.post(
  "/createZoomMeeting",
  verifyToken,
  VideoConsultantController.createZoomMeeting
);
apiRoute.post(
  "/deleteZoomMeeting",
  verifyToken,
  VideoConsultantController.deleteZoomMeeting
);
apiRoute.post(
  "/saveZoomMeetingSignature",
  verifyToken,
  VideoConsultantController.saveZoomMeetingSignature
);
apiRoute.post(
  "/getMeetingSignature",
  verifyToken,
  VideoConsultantController.getMeetingSignature
);

apiRoute.post("/notification", verifyToken, LoginController.notification);

// Feedback
apiRoute.post("/saveFeedback", verifyToken, FeedbackController.saveFeedback);
apiRoute.post("/getFeedback", verifyToken, FeedbackController.getFeedback);
apiRoute.post("/getDoctorFeedback", FeedbackController.getDoctorFeedback);

apiRoute.post(
  "/saveUserBankDetails",
  verifyToken,
  AppointmentController.saveUserBankDetails
);
apiRoute.post(
  "/getUserBankDetails",
  verifyToken,
  AppointmentController.getUserBankDetails
);

// Payment APIs
apiRoute.post(
  "/createWebPayment",
  verifyToken,
  PaymentController.createWebPayment
);
apiRoute.get("/om_return", PaymentController.om_return);
apiRoute.get("/om_cancel", PaymentController.om_cancel);
apiRoute.get("/om_notif", PaymentController.om_notif);

// Notification
apiRoute.post(
  "/getNotifications",
  verifyToken,
  NotificationController.getNotifications
);

// View doc with token
apiRoute.get(
  "/record/:token/:ext",
  verifyToken,
  DocumentController.fetchPatientDocView
);

// Revenue
apiRoute.post(
  "/getRevenueChartData",
  verifyToken,
  RevenueController.getRevenueChartData
);
apiRoute.post(
  "/getRevenueChartCounts",
  verifyToken,
  RevenueController.getRevenueChartCounts
);

apiRoute.use(function (req, res, next) {
  res.header(
    "Access-Control-Allow-Headers",
    "x-access-token, Origin, Content-Type, Accept"
  );
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});
apiRoute.use(function (req, res, next) {
  if (!req.route)
    return res
      .status(404)
      .send({ status: false, message: "Invalid URL / Method." });
  next();
});

module.exports = apiRoute;
