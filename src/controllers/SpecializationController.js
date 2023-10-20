const validator = require("./helpers/validate");
var multer = require("multer");

exports.view_specialization = (req, res, next) => {
  return res.render("view_specialization", {
    title: "Manage Specialization",
    data: [],
    success: req.flash("success"),
    error: req.flash("error"),
  });
};

exports.add_specialization = (req, res, next) => {
  return res.render("add_specialization", {
    title: "Specialization",
    success: req.flash("success"),
    error: req.flash("error"),
  });
};

exports.do_add_specialization = (req, res, next) => {
  return res.render("add_specialization", {
    err: err,
    title: "Specialization",
    name: req.body.name,
  });
};

exports.edit_specialization = (req, res) => {
  return res.render("edit_specialization", {
    title: "Edit Specialization",
    data: [],
    success: req.flash("success"),
    error: req.flash("error"),
  });
};

exports.delete_specialization = (req, res) => {
  return res.render("view_specialization", {
    title: "Manage Specialization",
    error: [],
  });
};
exports.do_edit_specialization = (req, res) => {
  return res.render("edit_specialization", {
    title: "Edit Specialization",
    data: [],
    success: req.flash("success"),
    error: req.flash("error"),
    err: err,
  });
};
