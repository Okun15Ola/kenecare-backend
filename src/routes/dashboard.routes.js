const express = require("express");

const LoginController = require("../controllers/LoginController.js");
const DashboardController = require("../controllers/DashboardController.js");
const UserController = require("../controllers/UserController.js");
const DepartmenttypeController = require("../controllers/DepartmenttypeController.js");
const BlogcategoryController = require("../controllers/BlogcategoryController.js");
const BlogController = require("../controllers/BlogController.js");
const AppointmentController = require("../controllers/AppointmentController.js");
const CityController = require("../controllers/CityController.js");
const TestimonialController = require("../controllers/TestimonialController.js");
const Section1Controller = require("../controllers/Section1Controller.js");
const SpecializationController = require("../controllers/SpecializationController.js");
const RegistrationcouncilController = require("../controllers/RegistrationcouncilController.js");
const DegreeController = require("../controllers/DegreeController.js");
const AjaxController = require("../controllers/AjaxController.js");
const PaymentController = require("../controllers/PaymentController.js");

const router = express.Router();

// const ifNotLoggedin = (req, res, next) => {
//   if (!req.session.userID) {
//     return res.redirect("/login");
//   }
//   next();
// };

// const ifLoggedin = (req, res, next) => {
//   if (typeof req.session.userID !== "undefined") {
//     return res.redirect("/dashboard");
//   }
//   next();
// };

router.get("/", LoginController.login);
router.get("/login", LoginController.login);
router.post("/do_login", LoginController.do_login);

router.get(
  "/forgot_password",

  LoginController.forgot_password
);
router.post("/reset_link", LoginController.reset_link);
router.get(
  "/reset_password/:key",

  LoginController.reset_password
);
router.post(
  "/updatepassword",

  LoginController.update_password
);

router.get("/dashboard", DashboardController.index);
router.post("/change_status", DashboardController.change_status);
router.get("/profile", DashboardController.profile);
router.post(
  "/profile_edit",

  DashboardController.profile_edit
);

router.get(
  "/change_password",

  DashboardController.change_password
);
router.post(
  "/update_password",

  DashboardController.update_password
);



router.get("/view_patients", UserController.view_patient_records);
router.get("/delete_user/:id", UserController.delete_user);
router.get("/view_doctor", UserController.view_doctor);
router.get(
  "/delete_doctor/:id",

  UserController.delete_doctor
);

router.get(
  "/view_department",

  DepartmenttypeController.view_department_type
);


router.get(
  "/add_department_type",

  DepartmenttypeController.add_department_type
);
router.post(
  "/do_add_department_type",

  DepartmenttypeController.do_add_department_type
);
router.get(
  "/edit_department_type/:id",

  DepartmenttypeController.edit_department_type
);
router.post(
  "/do_edit_department_type",

  DepartmenttypeController.do_edit_department_type
);
router.get(
  "/delete_department_type/:id",

  DepartmenttypeController.delete_department_type
);


router.get(
  "/view_blog_categories",

  BlogcategoryController.view_blog_category
);
router.get(
  "/add_blog_category",

  BlogcategoryController.add_blog_category
);
router.post(
  "/do_add_blog_category",

  BlogcategoryController.do_add_blog_category
);
router.get(
  "/edit_blog_category/:id",

  BlogcategoryController.edit_blog_category
);
router.post(
  "/do_edit_blog_category",

  BlogcategoryController.do_edit_blog_category
);
router.get(
  "/delete_blog_category/:id",

  BlogcategoryController.delete_blog_category
);

router.get("/view_blogs", BlogController.view_blog);
router.get("/add_blog", BlogController.add_blog);
router.post("/do_add_blog", BlogController.do_add_blog);
router.get("/edit_blog/:id", BlogController.edit_blog);
router.post("/do_edit_blog", BlogController.do_edit_blog);
router.get("/delete_blog/:id", BlogController.delete_blog);

router.get(
  "/view_appointment",

  AppointmentController.view_appointment
);
router.get(
  "/delete_appointment/:id",

  AppointmentController.delete_appointment
);

router.get("/view_city", CityController.view_city);
router.get("/add_city", CityController.add_city);
router.post("/do_add_city", CityController.do_add_city);
router.get("/edit_city/:id", CityController.edit_city);
router.post("/do_edit_city", CityController.do_edit_city);
router.get("/delete_city/:id", CityController.delete_city);

router.get(
  "/view_testimonial",

  TestimonialController.view_testimonial
);
router.get(
  "/add_testimonial",

  TestimonialController.add_testimonial
);
router.post(
  "/do_add_testimonial",

  TestimonialController.do_add_testimonial
);
router.get(
  "/edit_testimonial/:id",

  TestimonialController.edit_testimonial
);
router.post(
  "/do_edit_testimonial",

  TestimonialController.do_edit_testimonial
);
router.get(
  "/delete_testimonial/:id",

  TestimonialController.delete_testimonial
);

router.get(
  "/view_section1",

  Section1Controller.view_section1
);
router.get(
  "/add_section1",

  Section1Controller.add_section1
);
router.post(
  "/do_add_section1",

  Section1Controller.do_add_section1
);
router.get(
  "/edit_section1/:id",

  Section1Controller.edit_section1
);
router.post(
  "/do_edit_section1",

  Section1Controller.do_edit_section1
);
router.get(
  "/delete_section1/:id",

  Section1Controller.delete_section1
);

router.get(
  "/view_specialization",

  SpecializationController.view_specialization
);
router.get(
  "/add_specialization",

  SpecializationController.add_specialization
);
router.post(
  "/do_add_specialization",

  SpecializationController.do_add_specialization
);
router.get(
  "/edit_specialization/:id",

  SpecializationController.edit_specialization
);
router.post(
  "/do_edit_specialization",

  SpecializationController.do_edit_specialization
);
router.get(
  "/delete_specialization/:id",

  SpecializationController.delete_specialization
);

router.get(
  "/view_registration_council",

  RegistrationcouncilController.view_registration_council
);
router.get(
  "/add_registration_council",

  RegistrationcouncilController.add_registration_council
);
router.post(
  "/do_add_registration_council",

  RegistrationcouncilController.do_add_registration_council
);
router.get(
  "/edit_registration_council/:id",

  RegistrationcouncilController.edit_registration_council
);
router.post(
  "/do_edit_registration_council",

  RegistrationcouncilController.do_edit_registration_council
);
router.get(
  "/delete_registration_council/:id",

  RegistrationcouncilController.delete_registration_council
);

router.get("/view_degree", DegreeController.view_degree);
router.get("/add_degree", DegreeController.add_degree);
router.post(
  "/do_add_degree",

  DegreeController.do_add_degree
);
router.get(
  "/edit_degree/:id",

  DegreeController.edit_degree
);
router.post(
  "/do_edit_degree",

  DegreeController.do_edit_degree
);
router.get(
  "/delete_degree/:id",

  DegreeController.delete_degree
);

router.get("/logout", function (req, res) {
  req.session.destroy(function (err) {
    res.redirect("/login");
  });
});

router.post(
  "/getDocProfileVerificationData",

  AjaxController.getDocProfileVerificationData
);
router.post(
  "/updateApprovalStatus",

  AjaxController.updateApprovalStatus
);
router.post(
  "/updateDrAuthApprovalStatus",

  AjaxController.updateDrAuthApprovalStatus
);
router.post(
  "/getDoctorFullDetails",

  AjaxController.getDoctorFullDetails
);
router.post(
  "/getUserBankDetails",

  AjaxController.getUserBankDetails
);

// Payment page
router.get("/paymentCallback", PaymentController.paymentCallback);

module.exports = router;
