const { validationResult } = require("express-validator");
const validator = require("./helpers/validate");
var multer = require("multer");
var fs = require("fs");

exports.view_registration_council = (req, res, next) => {
  return res.render("view_registration_councils", {
    title: "Manage Registration Council",
    data: [],
    success: req.flash("success"),
    error: req.flash("error"),
  });
};

exports.add_registration_council = (req, res, next) => {
  return res.render("add_registration_council", {
    title: "Registration Council",
    success: req.flash("success"),
    error: req.flash("error"),
  });
};

exports.do_add_registration_council = (req, res, next) => {
  return res.render("add_registration_council", {
    err: err,
    title: "Registration Council",
    name: req.body.name,
  });
};

exports.edit_registration_council = (req, res) => {
  return res.render("edit_registration_council", {
    title: "Edit Registration Council",
    data: [],
    success: req.flash("success"),
    error: req.flash("error"),
  });
};

exports.delete_registration_council = (req, res) => {
  return res.render("view_registration_council", {
    title: "Manage Registration Council",
    error: [],
  });
};
exports.do_edit_registration_council = (req, res) => {
  return res.render("edit_registration_council", {
    title: "Edit Registration Council",
    data: [],
    success: req.flash("success"),
    error: req.flash("error"),
    err: err,
  });
};
