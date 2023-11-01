const { validationResult } = require("express-validator");
const validator = require("./helpers/validate");
var multer = require("multer");
var fs = require("fs");

exports.view_department_type = (req, res, next) => {
  return res.render("view_department", {
    title: "Department Type",
    data: [],
    success: req.flash("success"),
    error: req.flash("error"),
  });
};

exports.add_department_type = (req, res, next) => {
  res.render("add_department_type", {
    title: "Department Type",
    success: req.flash("success"),
    error: req.flash("error"),
  });
};

var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./public/upload/department_type");
  },
  filename: function (req, file, callback) {
    let extArray = file.originalname.split(".");
    let extension = extArray[extArray.length - 1];
    callback(null, file.fieldname + "-" + Date.now() + "." + extension);
  },
});
var upload = multer({ storage: storage }).single("image");

exports.do_add_department_type = (req, res, next) => {
  return res.render("add_department_type", {
    err: err,
    title: "Department Type",
    name: req.body.name,
    description: req.body.description,
  });
};

exports.edit_department_type = (req, res) => {
  return res.render("edit_department_type", {
    title: "Edit Department Type",
    data: [],
    success: req.flash("success"),
    error: req.flash("error"),
  });
};

exports.delete_department_type = (req, res) => {
  return res.render("view_department_type", {
    title: "Manage Department Type",
    error: [],
  });
};
exports.do_edit_department_type = (req, res) => {
  return res.render("edit_department_type", {
    title: "Edit Department Type",
    data: [],
    success: req.flash("success"),
    error: req.flash("error"),
    err: [],
  });
};
