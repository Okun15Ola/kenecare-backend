const { validationResult } = require("express-validator");
const validator = require("./helpers/validate");
var multer = require("multer");
var fs = require("fs");

exports.view_city = (req, res, next) => {
  return res.render("view_city", {
    title: "Manage City",
    data: [],
    success: req.flash("success"),
    error: req.flash("error"),
  });
  connectPool.query(
    "select * from city order by id DESC",
    (error, [], fields) => {
      if (error) {
        return res.render("view_city", {
          title: "Manage City",
          error: error,
          data: [],
        });
      }
      res.render("view_city", {
        title: "Manage City",
        data: [],
        success: req.flash("success"),
        error: req.flash("error"),
      });
    }
  );
};

exports.add_city = (req, res, next) => {
  return res.render("add_city", {
    title: "City",
    success: req.flash("success"),
    error: req.flash("error"),
  });
};

exports.do_add_city = (req, res, next) => {
  return res.render("add_city", {
    err: err,
    title: "City",
    name: req.body.name,
  });
  const validationRule = {
    name: "required",
  };
  validator(req.body, validationRule, {}, (err, status) => {
    if (status) {
      var name = req.body.name;

      var insQry = "INSERT INTO city SET name = '" + name + "'";

      connectPool.query(insQry, (error, [], fields) => {
        if (error) {
          req.flash("error", error);
          return res.redirect("/view_city");
        }
        id = [].insertId;
        req.flash("success", "City has been saved successfully!");
        return res.redirect("/view_city");
      });
    } else {
      //console.log(err.errors.email);
      res.render("add_city", {
        err: err,
        title: "City",
        name: req.body.name,
      });
    }
  });
};

exports.edit_city = (req, res) => {
  return res.render("edit_city", {
    title: "Edit City",
    data: [],
    success: req.flash("success"),
    error: req.flash("error"),
  });
  var id = req.params.id;
  let sql = "SELECT * FROM city WHERE id = " + id + " LIMIT 1";
  connectPool.query(sql, (error, [], fields) => {
    if (error) {
      req.flash("error", error);
      return res.redirect("/view_city");
    }
    return res.render("edit_city", {
      title: "Edit City",
      data: [],
      success: req.flash("success"),
      error: req.flash("error"),
    });
  });
};

exports.delete_city = (req, res) => {
  const id = req.params.id;

  let sql = "SELECT * FROM city WHERE id = " + id + " LIMIT 1";
  connectPool.query(sql, (error, [], fields) => {
    if (error) {
      req.flash("error", error);
      return res.redirect("/view_city");
    }
    if ([].length > 0) {
      connectPool.query(
        'DELETE FROM city WHERE id = "' + id + '" ',
        (errors, result, fields) => {
          if (errors) {
            return res.render("view_city", {
              title: "Manage City",
              error: errors,
            });
          }

          req.flash("success", "City Delete Successfully!");
          return res.redirect("/view_city");
        }
      );
    }
  });
};
exports.do_edit_city = (req, res) => {
  return res.render("edit_city", {
    title: "Edit City",
    data: [],
    success: req.flash("success"),
    error: req.flash("error"),
    err: [],
  });
  const validationRule = {
    name: "required",
  };
  validator(req.body, validationRule, {}, (err, status) => {
    if (status) {
      let sql = "SELECT * FROM city WHERE id = " + req.body.id + " LIMIT 1";
      connectPool.query(sql, (errors, result, fields) => {
        if (errors) {
          req.flash("error", error);
          return res.redirect("/view_city");
        }
        if (result.length > 0) {
          var fieldsToUpdate = {};
          fieldsToUpdate["name"] = req.body.name;

          var sqlupdate = "UPDATE city SET ? WHERE id  = " + req.body.id;
          connectPool.query(sqlupdate, fieldsToUpdate, function (error, []) {
            if (error) {
              req.flash("error", error);
              return res.redirect("/edit_city/" + req.body.id);
            }
            req.flash("success", "City has been updated successfully!");
            return res.redirect("/view_city");
          });
        } else {
          return res.redirect("/view_city");
        }
      });
    } else {
      let sql = "SELECT * FROM city WHERE id = " + req.body.id + " LIMIT 1";
      connectPool.query(sql, (error, [], fields) => {
        if (error) {
          req.flash("error", error);
          return res.redirect("/view_city");
        }
        return res.render("edit_city", {
          title: "Edit City",
          data: [],
          success: req.flash("success"),
          error: req.flash("error"),
          err: err,
        });
      });
    }
  });
};
