const { validationResult } = require("express-validator");
const validator = require("./helpers/validate");

// exports.view_user = (req, res, next) => {
//   res.render("view_user", {
//     title: "User",
//     data: [],
//     success: req.flash("success"),
//     error: req.flash("error"),
//   });
// };

exports.view_patient_records = (req, res, next) => {
  res.render("view_patients", {
    title: "Patient_Records",
    data: [],
    success: req.flash("success"),
    error: req.flash("error"),
  });
};

exports.delete_user = (req, res) => {
  const id = req.params.id;
  let sql = "SELECT * FROM user WHERE id = " + id + " LIMIT 1";
  connectPool.query(sql, (error, [], fields) => {
    if (error) {
      req.flash("error", error);
      return res.redirect("/view_user");
    }
    if ([].length > 0) {
      connectPool.query(
        'DELETE FROM user WHERE id = "' + id + '" ',
        (errors, result, fields) => {
          if (errors) {
            return res.render("view_user", {
              title: "Manage User",
              error: errors,
            });
          }
          req.flash("success", "User Delete Successfully!");
          return res.redirect("/view_user");
        }
      );
    }
  });
};

exports.view_doctor = (req, res, next) => {
  res.render("view_doctors", {
    title: "Manage Doctor",
    data: [],
    success: req.flash("success"),
    error: req.flash("error"),
  });
};

exports.delete_doctor = (req, res) => {
  const id = req.params.id;
  let sql = "SELECT * FROM user WHERE id = " + id + " LIMIT 1";
  connectPool.query(sql, (error, [], fields) => {
    if (error) {
      req.flash("error", error);
      return res.redirect("/view_doctor");
    }
    if ([].length > 0) {
      connectPool.query(
        'DELETE FROM user WHERE id = "' + id + '" ',
        (errors, result, fields) => {
          if (errors) {
            return res.render("view_doctor", {
              title: "Manage Doctor",
              error: errors,
            });
          }
          req.flash("success", "Doctor Delete Successfully!");
          return res.redirect("/view_doctor");
        }
      );
    }
  });
};
