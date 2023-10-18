const { validationResult } = require("express-validator");
const validator = require("./helpers/validate");
var multer = require("multer");
var fs = require("fs");

exports.view_department_type = (req, res, next) => {
  return res.render("view_department_type", {
    title: "Department Type",
    data: [],
    success: req.flash("success"),
    error: req.flash("error"),
  });
  // connectPool.query(
  //   "select * from department_type order by id DESC",
  //   (error, [], fields) => {
  //     if (error) {
  //       return res.render("view_department_type", {
  //         title: "Manage Department Type",
  //         error: error,
  //         data: [],
  //       });
  //     }
  //     res.render("view_department_type", {
  //       title: "Department Type",
  //       data: [],
  //       success: req.flash("success"),
  //       error: req.flash("error"),
  //     });
  //   }
  // );
};

exports.add_department_type = (req, res, next) => {
  res.render("add_department_type", {
    title: "Department Type",
    success: req.flash("success"),
    error: req.flash("error"),
  });
};

var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./public/upload/department_type");
  },
  filename: function (req, file, callback) {
    let extArray = file.originalname.split(".");
    let extension = extArray[extArray.length - 1];
    callback(null, file.fieldname + "-" + Date.now() + "." + extension);
  },
});
var upload = multer({ storage: storage }).single("image");

exports.do_add_department_type = (req, res, next) => {
  return res.render("add_department_type", {
    err: err,
    title: "Department Type",
    name: req.body.name,
    description: req.body.description,
  });
  // upload(req, res, function (err) {
  //   if (req.file) {
  //     const validationRule = {
  //       name: "required",
  //       description: "required",
  //     };
  //     validator(req.body, validationRule, {}, (err, status) => {
  //       if (status) {
  //         var name = req.body.name;
  //         var description = req.body.description;
  //         var prof_pic = req.file.filename;

  //         var insQry =
  //           "INSERT INTO department_type SET name = '" +
  //           name +
  //           "',description = '" +
  //           description +
  //           "', image = '" +
  //           prof_pic +
  //           "'";

  //         connectPool.query(insQry, (error, [], fields) => {
  //           if (error) {
  //             req.flash("error", error);
  //             return res.redirect("/view_department_type");
  //           }
  //           id = [].insertId;
  //           req.flash(
  //             "success",
  //             "Department Type has been saved successfully!"
  //           );
  //           return res.redirect("/view_department_type");
  //         });
  //       } else {
  //         //console.log(err.errors.email);
  //         res.render("add_department_type", {
  //           err: err,
  //           title: "Department Type",
  //           name: req.body.name,
  //           description: req.body.description,
  //         });
  //       }
  //     });
  //   } else {
  //     res.render("add_department_type", {
  //       err: err,
  //       title: "Department Type",
  //       name: req.body.name,
  //       description: req.body.description,
  //       imageval: "image field required",
  //     });
  //   }
  // });
};

exports.edit_department_type = (req, res) => {
  return res.render("edit_department_type", {
    title: "Edit Department Type",
    data: [],
    success: req.flash("success"),
    error: req.flash("error"),
  });
  // var id = req.params.id;
  // let sql = "SELECT * FROM department_type WHERE id = " + id + " LIMIT 1";
  // connectPool.query(sql, (error, [], fields) => {
  //   if (error) {
  //     req.flash("error", error);
  //     return res.redirect("/view_department_type");
  //   }
  //   return res.render("edit_department_type", {
  //     title: "Edit Department Type",
  //     data: [],
  //     success: req.flash("success"),
  //     error: req.flash("error"),
  //   });
  // });
};

exports.delete_department_type = (req, res) => {
  const id = req.params.id;

  let sql = "SELECT * FROM department_type WHERE id = " + id + " LIMIT 1";
  connectPool.query(sql, (error, [], fields) => {
    if (error) {
      req.flash("error", error);
      return res.redirect("/view_department_type");
    }
    if ([].length > 0) {
      connectPool.query(
        'DELETE FROM department_type WHERE id = "' + id + '" ',
        (errors, result, fields) => {
          if (errors) {
            return res.render("view_department_type", {
              title: "Manage Department Type",
              error: errors,
            });
          }
          var imagePath = "public/upload/department_type/" + [][0].image;
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
          req.flash("success", "Department Type Delete Successfully!");
          return res.redirect("/view_department_type");
        }
      );
    }
  });
};
exports.do_edit_department_type = (req, res) => {
  return res.render("edit_department_type", {
    title: "Edit Department Type",
    data: [],
    success: req.flash("success"),
    error: req.flash("error"),
    err: [],
  });
  // upload(req, res, function (err) {
  //   if (req.file) {
  //     const validationRule = {
  //       name: "required",
  //       description: "required",
  //     };
  //     validator(req.body, validationRule, {}, (err, status) => {
  //       if (status) {
  //         let sql =
  //           "SELECT * FROM department_type WHERE id = " +
  //           req.body.id +
  //           " LIMIT 1";
  //         connectPool.query(sql, (errors, result, fields) => {
  //           if (errors) {
  //             req.flash("error", errors);
  //             return res.redirect("/view_department_type");
  //           }
  //           if (result.length > 0) {
  //             var imagePath =
  //               "public/upload/department_type/" + result[0].image;
  //             if (fs.existsSync(imagePath)) {
  //               fs.unlinkSync(imagePath);
  //             }
  //             var fieldsToUpdate = {};
  //             fieldsToUpdate["name"] = req.body.name;
  //             fieldsToUpdate["description"] = req.body.description;
  //             fieldsToUpdate["image"] = req.file.filename;
  //             var sqlupdate =
  //               "UPDATE department_type SET ? WHERE id  = " + req.body.id;
  //             connectPool.query(
  //               sqlupdate,
  //               fieldsToUpdate,
  //               function (error, []) {
  //                 if (error) {
  //                   req.flash("error", error);
  //                   return res.redirect("/edit_department_type/" + req.body.id);
  //                 }
  //                 req.flash(
  //                   "success",
  //                   "Department Type has been updated successfully!"
  //                 );
  //                 return res.redirect("/view_department_type");
  //               }
  //             );
  //           } else {
  //             return res.redirect("/view_department_type");
  //           }
  //         });
  //       } else {
  //         let sql =
  //           "SELECT * FROM department_type WHERE id = " +
  //           req.body.id +
  //           " LIMIT 1";
  //         connectPool.query(sql, (error, [], fields) => {
  //           if (error) {
  //             req.flash("error", error);
  //             return res.redirect("/view_department_type");
  //           }
  //           return res.render("edit_department_type", {
  //             title: "Edit Department Type",
  //             data: [],
  //             success: req.flash("success"),
  //             error: req.flash("error"),
  //             err: err,
  //           });
  //         });
  //       }
  //     });
  //   } else {
  //     const validationRule = {
  //       name: "required",
  //       description: "required",
  //     };
  //     validator(req.body, validationRule, {}, (err, status) => {
  //       if (status) {
  //         var fieldsToUpdate = {};
  //         fieldsToUpdate["name"] = req.body.name;
  //         fieldsToUpdate["description"] = req.body.description;
  //         var sqlupdate =
  //           "UPDATE department_type SET ? WHERE id  = " + req.body.id;
  //         connectPool.query(
  //           sqlupdate,
  //           fieldsToUpdate,
  //           function (error, []) {
  //             if (error) {
  //               req.flash("error", error);
  //               return res.redirect("/edit_department_type/" + req.body.id);
  //             }
  //             req.flash(
  //               "success",
  //               "Department Type has been updated successfully!"
  //             );
  //             return res.redirect("/view_department_type");
  //           }
  //         );
  //       } else {
  //         let sql =
  //           "SELECT * FROM department_type WHERE id = " +
  //           req.body.id +
  //           " LIMIT 1";
  //         connectPool.query(sql, (error, [], fields) => {
  //           if (error) {
  //             req.flash("error", error);
  //             return res.redirect("/view_department_type");
  //           }
  //           return res.render("edit_department_type", {
  //             title: "Edit Department Type",
  //             data: [],
  //             success: req.flash("success"),
  //             error: req.flash("error"),
  //             err: err,
  //           });
  //         });
  //       }
  //     });
  //   }
  // });
};
