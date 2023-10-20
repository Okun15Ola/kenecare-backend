const { validationResult } = require("express-validator");
const validator = require("./helpers/validate");
var multer = require("multer");
var fs = require("fs");

exports.view_degree = (req, res, next) => {
  return res.render("view_degree", {
    title: "Manage Degree",
    data: [],
    success: req.flash("success"),
    error: req.flash("error"),
  });
};

exports.add_degree = (req, res, next) => {
  res.render("add_degree", {
    title: "Degree",
    success: req.flash("success"),
    error: req.flash("error"),
  });
};

exports.do_add_degree = (req, res, next) => {
  return res.render("add_degree", {
    err: err,
    title: "Degree",
    name: req.body.name,
  });
};

exports.edit_degree = (req, res) => {
  return res.render("edit_degree", {
    title: "Edit Degree",
    data: [],
    success: req.flash("success"),
    error: req.flash("error"),
  });
};

exports.delete_degree = (req, res) => {
  return res.render("view_degree", {
    title: "Manage Degree",
    error: [],
  });
};
exports.do_edit_degree = (req, res) => {
  return res.render("edit_degree", {
    title: "Edit Degree",
    data: [],
    success: req.flash("success"),
    error: req.flash("error"),
    err: err,
  });
};
