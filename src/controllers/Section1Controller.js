const { validationResult } = require("express-validator");
const validator = require("./helpers/validate");
var multer = require("multer");
var fs = require("fs");

exports.view_section1 = (req, res, next) => {
  return res.render("view_section1", {
    title: "Section1",
    data: [],
    success: req.flash("success"),
    error: req.flash("error"),
  });
};

exports.add_section1 = (req, res, next) => {
  return res.render("add_section1", {
    title: "Section1",
    success: req.flash("success"),
    error: req.flash("error"),
  });
};

var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./public/upload/section1");
  },
  filename: function (req, file, callback) {
    let extArray = file.originalname.split(".");
    let extension = extArray[extArray.length - 1];
    callback(null, file.fieldname + "-" + Date.now() + "." + extension);
  },
});
var upload = multer({ storage: storage }).single("image");

exports.do_add_section1 = (req, res, next) => {
  return res.render("add_section1", {
    err: [],
    title: "Section1",
    name: "",
    description: "",
  });
};

exports.edit_section1 = (req, res) => {
  return res.render("edit_section1", {
    title: "Edit Section1",
    data: [],
    success: req.flash("success"),
    error: req.flash("error"),
  });
};

exports.delete_section1 = (req, res) => {
  return res.render("view_section1", {
    title: "Manage Section1",
    error: [],
  });
  const id = req.params.id;
};
exports.do_edit_section1 = (req, res) => {
  return res.render("edit_section1", {
    title: "Edit Section1",
    data: [],
    success: req.flash("success"),
    error: req.flash("error"),
    err: [],
  });
};
