var multer = require("multer");
var fs = require("fs");

exports.view_testimonials = (req, res, next) => {

  return res.render("view_testimonials", {

    title: "Testimonial",
    data: [],
    success: req.flash("success"),
    error: req.flash("error"),
  });
};

exports.add_testimonial = (req, res, next) => {
  return res.render("add_testimonial", {
    title: "Testimonial",
    success: req.flash("success"),
    error: req.flash("error"),
  });
};

var storage = multer.diskStorage({

  destination: function (req, file, callback) {
    callback(null, "./public/upload/testimonial");
  },

  filename: function (req, file, callback) {
    let extArray = file.originalname.split(".");
    let extension = extArray[extArray.length - 1];
    callback(null, file.fieldname + "-" + Date.now() + "." + extension);
  },

});

var upload = multer({ storage: storage }).single("image");

exports.do_add_testimonial = (req, res, next) => {
  return res.render("add_testimonial", {
    err: err,
    title: "Testimonial",
    name: req.body.name,
    description: req.body.description,
  });
};

exports.edit_testimonial = (req, res) => {
  return res.render("edit_testimonial", {
    title: "Edit Testimonial",
    data: [],
    success: req.flash("success"),
    error: req.flash("error"),
  });
};

exports.delete_testimonial = (req, res) => {
  return res.render("view_testimonial", {
    title: "Manage Testimonial",
    error: [],
  });
};

exports.do_edit_testimonial = (req, res) => {
  return res.render("edit_testimonial", {
    title: "Edit Testimonial",
    data: [],
    success: req.flash("success"),
    error: req.flash("error"),
    err: err,
  });
};
