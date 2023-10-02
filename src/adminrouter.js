var express = require('express');

const LoginController = require("./controllers/LoginController.js");
const DashboardController = require("./controllers/DashboardController.js");
const UserController = require("./controllers/UserController.js");
const DepartmenttypeController = require("./controllers/DepartmenttypeController.js");
const BlogcategoryController = require("./controllers/BlogcategoryController.js");
const BlogController = require("./controllers/BlogController.js");
const AppointmentController = require("./controllers/AppointmentController.js");
const CityController = require("./controllers/CityController.js");
const TestimonialController = require("./controllers/TestimonialController.js");
const Section1Controller = require("./controllers/Section1Controller.js");
const SpecializationController = require("./controllers/SpecializationController.js");
const RegistrationcouncilController = require("./controllers/RegistrationcouncilController.js");
const DegreeController = require("./controllers/DegreeController.js");
const AjaxController = require("./controllers/AjaxController.js");
const PaymentController = require("./controllers/PaymentController.js");

const adminRouter = express.Router();

const ifNotLoggedin = (req, res, next) => {
    if (!req.session.userID) {
        return res.redirect('/login');
    }
    next();
}

const ifLoggedin = (req, res, next) => {

    if (typeof req.session.userID !== 'undefined') {
        return res.redirect('/dashboard');
    }
    next();
}

adminRouter.get('/', ifLoggedin, LoginController.login);
adminRouter.get('/index', ifLoggedin, LoginController.login);
adminRouter.get('/login', ifLoggedin, LoginController.login);
adminRouter.post('/do_login', LoginController.do_login);

adminRouter.get('/forgot_password', ifLoggedin, LoginController.forgot_password);
adminRouter.post('/reset_link', ifLoggedin, LoginController.reset_link);
adminRouter.get('/reset_password/:key', ifLoggedin, LoginController.reset_password);
adminRouter.post('/updatepassword', ifLoggedin, LoginController.update_password);

adminRouter.post('/change_status', ifNotLoggedin, DashboardController.change_status);
adminRouter.get('/dashboard', ifNotLoggedin, DashboardController.index);
adminRouter.get('/profile', ifNotLoggedin, DashboardController.profile);
adminRouter.post('/profile_edit', ifNotLoggedin, DashboardController.profile_edit);

adminRouter.get('/change_password', ifNotLoggedin, DashboardController.change_password);
adminRouter.post('/update_password', ifNotLoggedin, DashboardController.update_password);

adminRouter.get('/view_user', ifNotLoggedin, UserController.view_user);
adminRouter.get('/delete_user/:id', ifNotLoggedin, UserController.delete_user);
adminRouter.get('/view_doctor', ifNotLoggedin, UserController.view_doctor);
adminRouter.get('/delete_doctor/:id', ifNotLoggedin, UserController.delete_doctor);

adminRouter.get('/view_department_type', ifNotLoggedin, DepartmenttypeController.view_department_type);
adminRouter.get('/add_department_type', ifNotLoggedin, DepartmenttypeController.add_department_type);
adminRouter.post('/do_add_department_type', ifNotLoggedin, DepartmenttypeController.do_add_department_type);
adminRouter.get('/edit_department_type/:id', ifNotLoggedin, DepartmenttypeController.edit_department_type);
adminRouter.post('/do_edit_department_type', ifNotLoggedin, DepartmenttypeController.do_edit_department_type);
adminRouter.get('/delete_department_type/:id', ifNotLoggedin, DepartmenttypeController.delete_department_type);

adminRouter.get('/view_blog_category', ifNotLoggedin, BlogcategoryController.view_blog_category);
adminRouter.get('/add_blog_category', ifNotLoggedin, BlogcategoryController.add_blog_category);
adminRouter.post('/do_add_blog_category', ifNotLoggedin, BlogcategoryController.do_add_blog_category);
adminRouter.get('/edit_blog_category/:id', ifNotLoggedin, BlogcategoryController.edit_blog_category);
adminRouter.post('/do_edit_blog_category', ifNotLoggedin, BlogcategoryController.do_edit_blog_category);
adminRouter.get('/delete_blog_category/:id', ifNotLoggedin, BlogcategoryController.delete_blog_category);


adminRouter.get('/view_blog', ifNotLoggedin, BlogController.view_blog);
adminRouter.get('/add_blog', ifNotLoggedin, BlogController.add_blog);
adminRouter.post('/do_add_blog', ifNotLoggedin, BlogController.do_add_blog);
adminRouter.get('/edit_blog/:id', ifNotLoggedin, BlogController.edit_blog);
adminRouter.post('/do_edit_blog', ifNotLoggedin, BlogController.do_edit_blog);
adminRouter.get('/delete_blog/:id', ifNotLoggedin, BlogController.delete_blog);

adminRouter.get('/view_appointment', ifNotLoggedin, AppointmentController.view_appointment);
adminRouter.get('/delete_appointment/:id', ifNotLoggedin, AppointmentController.delete_appointment);


adminRouter.get('/view_city', ifNotLoggedin, CityController.view_city);
adminRouter.get('/add_city', ifNotLoggedin, CityController.add_city);
adminRouter.post('/do_add_city', ifNotLoggedin, CityController.do_add_city);
adminRouter.get('/edit_city/:id', ifNotLoggedin, CityController.edit_city);
adminRouter.post('/do_edit_city', ifNotLoggedin, CityController.do_edit_city);
adminRouter.get('/delete_city/:id', ifNotLoggedin, CityController.delete_city);

adminRouter.get('/view_testimonial', ifNotLoggedin, TestimonialController.view_testimonial);
adminRouter.get('/add_testimonial', ifNotLoggedin, TestimonialController.add_testimonial);
adminRouter.post('/do_add_testimonial', ifNotLoggedin, TestimonialController.do_add_testimonial);
adminRouter.get('/edit_testimonial/:id', ifNotLoggedin, TestimonialController.edit_testimonial);
adminRouter.post('/do_edit_testimonial', ifNotLoggedin, TestimonialController.do_edit_testimonial);
adminRouter.get('/delete_testimonial/:id', ifNotLoggedin, TestimonialController.delete_testimonial);

adminRouter.get('/view_section1', ifNotLoggedin, Section1Controller.view_section1);
adminRouter.get('/add_section1', ifNotLoggedin, Section1Controller.add_section1);
adminRouter.post('/do_add_section1', ifNotLoggedin, Section1Controller.do_add_section1);
adminRouter.get('/edit_section1/:id', ifNotLoggedin, Section1Controller.edit_section1);
adminRouter.post('/do_edit_section1', ifNotLoggedin, Section1Controller.do_edit_section1);
adminRouter.get('/delete_section1/:id', ifNotLoggedin, Section1Controller.delete_section1);


adminRouter.get('/view_specialization', ifNotLoggedin, SpecializationController.view_specialization);
adminRouter.get('/add_specialization', ifNotLoggedin, SpecializationController.add_specialization);
adminRouter.post('/do_add_specialization', ifNotLoggedin, SpecializationController.do_add_specialization);
adminRouter.get('/edit_specialization/:id', ifNotLoggedin, SpecializationController.edit_specialization);
adminRouter.post('/do_edit_specialization', ifNotLoggedin, SpecializationController.do_edit_specialization);
adminRouter.get('/delete_specialization/:id', ifNotLoggedin, SpecializationController.delete_specialization);

adminRouter.get('/view_registration_council', ifNotLoggedin, RegistrationcouncilController.view_registration_council);
adminRouter.get('/add_registration_council', ifNotLoggedin, RegistrationcouncilController.add_registration_council);
adminRouter.post('/do_add_registration_council', ifNotLoggedin, RegistrationcouncilController.do_add_registration_council);
adminRouter.get('/edit_registration_council/:id', ifNotLoggedin, RegistrationcouncilController.edit_registration_council);
adminRouter.post('/do_edit_registration_council', ifNotLoggedin, RegistrationcouncilController.do_edit_registration_council);
adminRouter.get('/delete_registration_council/:id', ifNotLoggedin, RegistrationcouncilController.delete_registration_council);

adminRouter.get('/view_degree', ifNotLoggedin, DegreeController.view_degree);
adminRouter.get('/add_degree', ifNotLoggedin, DegreeController.add_degree);
adminRouter.post('/do_add_degree', ifNotLoggedin, DegreeController.do_add_degree);
adminRouter.get('/edit_degree/:id', ifNotLoggedin, DegreeController.edit_degree);
adminRouter.post('/do_edit_degree', ifNotLoggedin, DegreeController.do_edit_degree);
adminRouter.get('/delete_degree/:id', ifNotLoggedin, DegreeController.delete_degree);

adminRouter.get('/logout', function(req, res) {
    req.session.destroy(function(err) {
        res.redirect('/login');
    });
});

adminRouter.post('/getDocProfileVerificationData', ifNotLoggedin, AjaxController.getDocProfileVerificationData);
adminRouter.post('/updateApprovalStatus', ifNotLoggedin, AjaxController.updateApprovalStatus);
adminRouter.post('/updateDrAuthApprovalStatus', ifNotLoggedin, AjaxController.updateDrAuthApprovalStatus);
adminRouter.post('/getDoctorFullDetails', ifNotLoggedin, AjaxController.getDoctorFullDetails);
adminRouter.post('/getUserBankDetails', ifNotLoggedin, AjaxController.getUserBankDetails);

// Payment page
adminRouter.get('/paymentCallback', PaymentController.paymentCallback);

module.exports = adminRouter;