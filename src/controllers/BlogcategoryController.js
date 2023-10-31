const { validationResult } = require("express-validator");
const validator = require("./helpers/validate");
var multer = require("multer");
var fs = require("fs");

exports.view_blog_category = (req, res, next) => {
  return res.render("view_blog_categories", {
    title: "Category",
    data: [],
    success: req.flash("success"),
    error: req.flash("error"),
  });
  // connectPool.query(
  //   "select * from blog_category order by id DESC",
  //   (error, results, fields) => {
  //     if (error) {
  //       return res.render("view_blog_category", {
  //         title: "Manage Category",
  //         error: error,
  //         data: [],
  //       });
  //     }
  //     res.render("view_blog_category", {
  //       title: "Category",
  //       data: results,
  //       success: req.flash("success"),
  //       error: req.flash("error"),
  //     });
  //   }
  // );
};

exports.add_blog_category = (req, res, next) => {
  return res.render("add_blog_category", {
    title: "Category",
    success: req.flash("success"),
    error: req.flash("error"),
  });
};

exports.do_add_blog_category = (req, res, next) => {
  return res.render("add_blog_category", {
    err: err,
    title: "Category",
    name: req.body.name,
  });
  // const validationRule = {
  //   name: "required",
  // };
  // validator(req.body, validationRule, {}, (err, status) => {
  //   if (status) {
  //     var name = req.body.name;

  //     var insQry = "INSERT INTO blog_category SET name = '" + name + "'";

  //     connectPool.query(insQry, (error, results, fields) => {
  //       if (error) {
  //         req.flash("error", error);
  //         return res.redirect("/view_blog_category");
  //       }
  //       id = results.insertId;
  //       req.flash("success", "Category has been saved successfully!");
  //       return res.redirect("/view_blog_category");
  //     });
  //   } else {
  //     //console.log(err.errors.email);
  //     res.render("add_blog_category", {
  //       err: err,
  //       title: "Category",
  //       name: req.body.name,
  //     });
  //   }
  // });
};

exports.edit_blog_category = (req, res) => {
  return res.render("edit_blog_category", {
    title: "Edit Category",
    data: results,
    success: req.flash("success"),
    error: req.flash("error"),
  });
  // var id = req.params.id;
  // let sql = "SELECT * FROM blog_category WHERE id = " + id + " LIMIT 1";
  // connectPool.query(sql, (error, results, fields) => {
  //   if (error) {
  //     req.flash("error", error);
  //     return res.redirect("/view_blog_category");
  //   }
  //   return res.render("edit_blog_category", {
  //     title: "Edit Category",
  //     data: results,
  //     success: req.flash("success"),
  //     error: req.flash("error"),
  //   });
  // });
};

exports.delete_blog_category = (req, res) => {
  const id = req.params.id;

  let sql = "SELECT * FROM blog_category WHERE id = " + id + " LIMIT 1";
  connectPool.query(sql, (error, results, fields) => {
    if (error) {
      req.flash("error", error);
      return res.redirect("/view_blog_category");
    }
    if (results.length > 0) {
      connectPool.query(
        'DELETE FROM blog_category WHERE id = "' + id + '" ',
        (errors, result, fields) => {
          if (errors) {
            return res.render("view_blog_category", {
              title: "Manage Category",
              error: errors,
            });
          }

          req.flash("success", "Category Delete Successfully!");
          return res.redirect("/view_blog_category");
        }
      );
    }
  });
};
exports.do_edit_blog_category = (req, res) => {
  return res.render("edit_blog_category", {
    title: "Edit Category",
    data: results,
    success: req.flash("success"),
    error: req.flash("error"),
    err: err,
  });
  // const validationRule = {
  //   name: "required",
  // };
  // validator(req.body, validationRule, {}, (err, status) => {
  //   if (status) {
  //     let sql =
  //       "SELECT * FROM blog_category WHERE id = " + req.body.id + " LIMIT 1";
  //     connectPool.query(sql, (errors, result, fields) => {
  //       if (errors) {
  //         req.flash("error", error);
  //         return res.redirect("/view_blog_category");
  //       }
  //       if (result.length > 0) {
  //         var fieldsToUpdate = {};
  //         fieldsToUpdate["name"] = req.body.name;

  //         var sqlupdate =
  //           "UPDATE blog_category SET ? WHERE id  = " + req.body.id;
  //         connectPool.query(
  //           sqlupdate,
  //           fieldsToUpdate,
  //           function (error, results) {
  //             if (error) {
  //               req.flash("error", error);
  //               return res.redirect("/edit_blog_category/" + req.body.id);
  //             }
  //             req.flash("success", "Category has been updated successfully!");
  //             return res.redirect("/view_blog_category");
  //           }
  //         );
  //       } else {
  //         return res.redirect("/view_blog_category");
  //       }
  //     });
  //   } else {
  //     let sql =
  //       "SELECT * FROM blog_category WHERE id = " + req.body.id + " LIMIT 1";
  //     connectPool.query(sql, (error, results, fields) => {
  //       if (error) {
  //         req.flash("error", error);
  //         return res.redirect("/view_blog_category");
  //       }
  //       return res.render("edit_blog_category", {
  //         title: "Edit Category",
  //         data: results,
  //         success: req.flash("success"),
  //         error: req.flash("error"),
  //         err: err,
  //       });
  //     });
  //   }
  // });
};
