// const { validationResult } = require("express-validator");
const validator = require("./helpers/validate");
var multer = require("multer");
// var fs = require("fs");

exports.view_specialization = (req, res, next) => {
  return res.render("view_specialization", {
    title: "Manage Specialization",
    data: [],
    success: req.flash("success"),
    error: req.flash("error"),
  });
  connectPool.query(
    "select * from specialization order by id DESC",
    (error, [], fields) => {
      if (error) {
        return res.render("view_specialization", {
          title: "Manage Specialization",
          error: error,
          data: [],
        });
      }
      res.render("view_specialization", {
        title: "Manage Specialization",
        data: [],
        success: req.flash("success"),
        error: req.flash("error"),
      });
    }
  );
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
  const validationRule = {
    name: "required",
  };
  validator(req.body, validationRule, {}, (err, status) => {
    if (status) {
      var name = req.body.name;

      var insQry = "INSERT INTO specialization SET name = '" + name + "'";

      connectPool.query(insQry, (error, [], fields) => {
        if (error) {
          req.flash("error", error);
          return res.redirect("/view_specialization");
        }
        id = [].insertId;
        req.flash("success", "Specialization has been saved successfully!");
        return res.redirect("/view_specialization");
      });
    } else {
      //console.log(err.errors.email);
      res.render("add_specialization", {
        err: err,
        title: "Specialization",
        name: req.body.name,
      });
    }
  });
};

exports.edit_specialization = (req, res) => {
  return res.render("edit_specialization", {
    title: "Edit Specialization",
    data: [],
    success: req.flash("success"),
    error: req.flash("error"),
  });
  var id = req.params.id;
  let sql = "SELECT * FROM specialization WHERE id = " + id + " LIMIT 1";
  connectPool.query(sql, (error, [], fields) => {
    if (error) {
      req.flash("error", error);
      return res.redirect("/view_specialization");
    }
    return res.render("edit_specialization", {
      title: "Edit Specialization",
      data: [],
      success: req.flash("success"),
      error: req.flash("error"),
    });
  });
};

exports.delete_specialization = (req, res) => {
  return res.render("view_specialization", {
    title: "Manage Specialization",
    error: [],
  });
  const id = req.params.id;

  let sql = "SELECT * FROM specialization WHERE id = " + id + " LIMIT 1";
  connectPool.query(sql, (error, [], fields) => {
    if (error) {
      req.flash("error", error);
      return res.redirect("/view_specialization");
    }
    if ([].length > 0) {
      connectPool.query(
        'DELETE FROM specialization WHERE id = "' + id + '" ',
        (errors, result, fields) => {
          if (errors) {
            return res.render("view_specialization", {
              title: "Manage Specialization",
              error: errors,
            });
          }

          req.flash("success", "Specialization Delete Successfully!");
          return res.redirect("/view_specialization");
        }
      );
    }
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
  const validationRule = {
    name: "required",
  };
  validator(req.body, validationRule, {}, (err, status) => {
    if (status) {
      let sql =
        "SELECT * FROM specialization WHERE id = " + req.body.id + " LIMIT 1";
      connectPool.query(sql, (errors, result, fields) => {
        if (errors) {
          req.flash("error", error);
          return res.redirect("/view_specialization");
        }
        if (result.length > 0) {
          var fieldsToUpdate = {};
          fieldsToUpdate["name"] = req.body.name;

          var sqlupdate =
            "UPDATE specialization SET ? WHERE id  = " + req.body.id;
          connectPool.query(sqlupdate, fieldsToUpdate, function (error, []) {
            if (error) {
              req.flash("error", error);
              return res.redirect("/edit_specialization/" + req.body.id);
            }
            req.flash(
              "success",
              "Specialization has been updated successfully!"
            );
            return res.redirect("/view_specialization");
          });
        } else {
          return res.redirect("/view_specialization");
        }
      });
    } else {
      let sql =
        "SELECT * FROM specialization WHERE id = " + req.body.id + " LIMIT 1";
      connectPool.query(sql, (error, [], fields) => {
        if (error) {
          req.flash("error", error);
          return res.redirect("/view_specialization");
        }
        return res.render("edit_specialization", {
          title: "Edit Specialization",
          data: [],
          success: req.flash("success"),
          error: req.flash("error"),
          err: err,
        });
      });
    }
  });
};
