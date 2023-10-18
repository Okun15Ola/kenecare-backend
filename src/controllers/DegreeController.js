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
  // connectPool.query(
  //   "select * from degree order by id DESC",
  //   (error, [], fields) => {
  //     if (error) {
  //       return res.render("view_degree", {
  //         title: "Manage Degree",
  //         error: error,
  //         data: [],
  //       });
  //     }
  //     res.render("view_degree", {
  //       title: "Manage Degree",
  //       data: [],
  //       success: req.flash("success"),
  //       error: req.flash("error"),
  //     });
  //   }
  // );
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
  const validationRule = {
    name: "required",
  };
  validator(req.body, validationRule, {}, (err, status) => {
    if (status) {
      var name = req.body.name;

      var insQry = "INSERT INTO degree SET name = '" + name + "'";

      connectPool.query(insQry, (error, [], fields) => {
        if (error) {
          req.flash("error", error);
          return res.redirect("/view_degree");
        }
        id = [].insertId;
        req.flash("success", "Degree has been saved successfully!");
        return res.redirect("/view_degree");
      });
    } else {
      //console.log(err.errors.email);
      res.render("add_degree", {
        err: err,
        title: "Degree",
        name: req.body.name,
      });
    }
  });
};

exports.edit_degree = (req, res) => {
  return res.render("edit_degree", {
    title: "Edit Degree",
    data: [],
    success: req.flash("success"),
    error: req.flash("error"),
  });
  var id = req.params.id;
  let sql = "SELECT * FROM degree WHERE id = " + id + " LIMIT 1";
  connectPool.query(sql, (error, [], fields) => {
    if (error) {
      req.flash("error", error);
      return res.redirect("/view_degree");
    }
    return res.render("edit_degree", {
      title: "Edit Degree",
      data: [],
      success: req.flash("success"),
      error: req.flash("error"),
    });
  });
};

exports.delete_degree = (req, res) => {
  return res.render("view_degree", {
    title: "Manage Degree",
    error: [],
  });
  const id = req.params.id;

  let sql = "SELECT * FROM degree WHERE id = " + id + " LIMIT 1";
  connectPool.query(sql, (error, [], fields) => {
    if (error) {
      req.flash("error", error);
      return res.redirect("/view_degree");
    }
    if ([].length > 0) {
      connectPool.query(
        'DELETE FROM degree WHERE id = "' + id + '" ',
        (errors, result, fields) => {
          if (errors) {
            return res.render("view_degree", {
              title: "Manage Degree",
              error: errors,
            });
          }

          req.flash("success", "Degree Delete Successfully!");
          return res.redirect("/view_degree");
        }
      );
    }
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
  // const validationRule = {
  //   name: "required",
  // };
  // validator(req.body, validationRule, {}, (err, status) => {
  //   if (status) {
  //     let sql = "SELECT * FROM degree WHERE id = " + req.body.id + " LIMIT 1";
  //     connectPool.query(sql, (errors, result, fields) => {
  //       if (errors) {
  //         req.flash("error", error);
  //         return res.redirect("/view_degree");
  //       }
  //       if (result.length > 0) {
  //         var fieldsToUpdate = {};
  //         fieldsToUpdate["name"] = req.body.name;

  //         var sqlupdate = "UPDATE degree SET ? WHERE id  = " + req.body.id;
  //         connectPool.query(sqlupdate, fieldsToUpdate, function (error, []) {
  //           if (error) {
  //             req.flash("error", error);
  //             return res.redirect("/edit_degree/" + req.body.id);
  //           }
  //           req.flash("success", "Degree has been updated successfully!");
  //           return res.redirect("/view_degree");
  //         });
  //       } else {
  //         return res.redirect("/view_degree");
  //       }
  //     });
  //   } else {
  //     let sql = "SELECT * FROM degree WHERE id = " + req.body.id + " LIMIT 1";
  //     connectPool.query(sql, (error, [], fields) => {
  //       if (error) {
  //         req.flash("error", error);
  //         return res.redirect("/view_degree");
  //       }
  //       return res.render("edit_degree", {
  //         title: "Edit Degree",
  //         data: [],
  //         success: req.flash("success"),
  //         error: req.flash("error"),
  //         err: err,
  //       });
  //     });
  //   }
  // });
};
