// const { validationResult } = require("express-validator");
const validator = require("./helpers/validate");
const { compareSync, hashSync, genSaltSync } = require("bcryptjs");
// var fs = require("fs");

// Login Page
exports.index = (req, res, next) => {
  return res.render("dashboard_new", {
    total_departments: 100,
    total_doctors: 100,
    total_patients: 100,
    total_appointments: 100,
    patients: [],
    doctors: [],
    title: "Dashboard",
  });
};


// //New Dashboard
// exports.index = (req, res, next) => {
//   return res.render("admin_dashboard", {
//   total_departments: 100,
//   total_doctors: 100,
//   total_patients: 100,
//   total_appointments: 100,
//   patients: [],
//   doctors: [],
//   title: "Admin_Dashboard",
//   });
// };

exports.profile = (req, res) => {
  return res.render("profile", {
    title: "Profile",
    data: [],
    success: req.flash("success"),
  });
};

exports.profile_edit = (req, res) => {
  return res.render("profile", {
    title: "Profile",
    data: [],
    err: [],
  });
};

exports.change_password = (req, res) => {
  return res.render("change_password", {
    title: "Change Password",
    success: req.flash("success"),
    error: req.flash("error"),
  });
};

exports.update_password = (req, res) => {
  return res.render("change_password", {
    title: "Change Password",
    err: err,
  });
};

exports.change_status = (req, res) => {
  const body = req.body;

  var id_name = body.id_name;
  var id = body.id;
  var field_name = body.field_name;
  var status = body.status;
  var table = body.table;

  var fieldsToUpdate = {};
  fieldsToUpdate[field_name] = status;
  var sqlupdate = "UPDATE " + table + " SET ? WHERE " + id_name + "  = " + id;
  connectPool.query(sqlupdate, fieldsToUpdate, function (errors, []) {
    if (errors) {
      return res.status(200).json({
        status: "success",
        data: 1,
      });
    }
    return res.status(200).json({
      status: "success",
      data: 1,
    });
  });
};
