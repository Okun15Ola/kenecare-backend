const { validationResult } = require("express-validator");
const validator = require("../helpers/validate");
var multer = require("multer");
var fs = require("fs");

exports.view_dashboard = (req, res, next) => {
  return res.render("admin_dashboard", 
  {
    title: "Department Type",
    data: [],
    success: req.flash("success"),
    error: req.flash("error"),
  });
};


//New Dashboard
// exports.view_dashboard = (req, res, next) => {
//   return res.render("admin_dashboard", {
//   // total_departments: 100,
//   // total_doctors: 100,
//   // total_patients: 100,
//   // total_appointments: 100,
//   // patients: [],
//   // doctors: [],
//   title: "Admin_Dashboard",
//   });
// };