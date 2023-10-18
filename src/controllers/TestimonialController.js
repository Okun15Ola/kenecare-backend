// const { validationResult } = require("express-validator");
// const validator = require("./helpers/validate");
var multer = require("multer");
var fs = require("fs");

exports.view_testimonial = (req, res, next) => {
  return res.render("view_testimonial", {
    title: "Testimonial",
    data: [],
    success: req.flash("success"),
    error: req.flash("error"),
  });
  // connectPool.query(
  //   "select * from testimonial order by id DESC",
  //   (error, [], fields) => {
  //     if (error) {
  //       return res.render("view_testimonial", {
  //         title: "Manage Testimonial",
  //         error: error,
  //         data: [],
  //       });
  //     }
  //     res.render("view_testimonial", {
  //       title: "Testimonial",
  //       data: [],
  //       success: req.flash("success"),
  //       error: req.flash("error"),
  //     });
  //   }
  // );
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
  //           "INSERT INTO testimonial SET name = '" +
  //           name +
  //           "',description = '" +
  //           description +
  //           "', image = '" +
  //           prof_pic +
  //           "'";

  //         connectPool.query(insQry, (error, [], fields) => {
  //           if (error) {
  //             req.flash("error", error);
  //             return res.redirect("/view_testimonial");
  //           }
  //           id = [].insertId;
  //           req.flash("success", "Testimonial has been saved successfully!");
  //           return res.redirect("/view_testimonial");
  //         });
  //       } else {
  //         //console.log(err.errors.email);
  //         res.render("add_testimonial", {
  //           err: err,
  //           title: "Testimonial",
  //           name: req.body.name,
  //           description: req.body.description,
  //         });
  //       }
  //     });
  //   } else {
  //     res.render("add_testimonial", {
  //       err: err,
  //       title: "Testimonial",
  //       name: req.body.name,
  //       description: req.body.description,
  //       imageval: "image field required",
  //     });
  //   }
  // });
};

exports.edit_testimonial = (req, res) => {
  return res.render("edit_testimonial", {
    title: "Edit Testimonial",
    data: [],
    success: req.flash("success"),
    error: req.flash("error"),
  });
  // var id = req.params.id;
  // let sql = "SELECT * FROM testimonial WHERE id = " + id + " LIMIT 1";
  // connectPool.query(sql, (error, [], fields) => {
  //   if (error) {
  //     req.flash("error", error);
  //     return res.redirect("/view_testimonial");
  //   }
  //   return res.render("edit_testimonial", {
  //     title: "Edit Testimonial",
  //     data: [],
  //     success: req.flash("success"),
  //     error: req.flash("error"),
  //   });
  // });
};

exports.delete_testimonial = (req, res) => {
  return res.render("view_testimonial", {
    title: "Manage Testimonial",
    error: [],
  });
  // const id = req.params.id;

  // let sql = "SELECT * FROM testimonial WHERE id = " + id + " LIMIT 1";
  // connectPool.query(sql, (error, [], fields) => {
  //   if (error) {
  //     req.flash("error", error);
  //     return res.redirect("/view_testimonial");
  //   }
  //   if ([].length > 0) {
  //     connectPool.query(
  //       'DELETE FROM testimonial WHERE id = "' + id + '" ',
  //       (errors, result, fields) => {
  //         if (errors) {
  //           return res.render("view_testimonial", {
  //             title: "Manage Testimonial",
  //             error: errors,
  //           });
  //         }
  //         var imagePath = "public/upload/testimonial/" + [][0].image;
  //         if (fs.existsSync(imagePath)) {
  //           fs.unlinkSync(imagePath);
  //         }
  //         req.flash("success", "Testimonial Delete Successfully!");
  //         return res.redirect("/view_testimonial");
  //       }
  //     );
  //   }
  // });
};
exports.do_edit_testimonial = (req, res) => {
  return res.render("edit_testimonial", {
    title: "Edit Testimonial",
    data: [],
    success: req.flash("success"),
    error: req.flash("error"),
    err: err,
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
  //           "SELECT * FROM testimonial WHERE id = " + req.body.id + " LIMIT 1";
  //         connectPool.query(sql, (errors, result, fields) => {
  //           if (errors) {
  //             req.flash("error", errors);
  //             return res.redirect("/view_testimonial");
  //           }
  //           if (result.length > 0) {
  //             var imagePath = "public/upload/testimonial/" + result[0].image;
  //             if (fs.existsSync(imagePath)) {
  //               fs.unlinkSync(imagePath);
  //             }
  //             var fieldsToUpdate = {};
  //             fieldsToUpdate["name"] = req.body.name;
  //             fieldsToUpdate["description"] = req.body.description;
  //             fieldsToUpdate["image"] = req.file.filename;
  //             var sqlupdate =
  //               "UPDATE testimonial SET ? WHERE id  = " + req.body.id;
  //             connectPool.query(
  //               sqlupdate,
  //               fieldsToUpdate,
  //               function (error, []) {
  //                 if (error) {
  //                   req.flash("error", error);
  //                   return res.redirect("/edit_testimonial/" + req.body.id);
  //                 }
  //                 req.flash(
  //                   "success",
  //                   "Testimonial has been updated successfully!"
  //                 );
  //                 return res.redirect("/view_testimonial");
  //               }
  //             );
  //           } else {
  //             return res.redirect("/view_testimonial");
  //           }
  //         });
  //       } else {
  //         let sql =
  //           "SELECT * FROM testimonial WHERE id = " + req.body.id + " LIMIT 1";
  //         connectPool.query(sql, (error, [], fields) => {
  //           if (error) {
  //             req.flash("error", error);
  //             return res.redirect("/view_testimonial");
  //           }
  //           return res.render("edit_testimonial", {
  //             title: "Edit Testimonial",
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
  //         var sqlupdate = "UPDATE testimonial SET ? WHERE id  = " + req.body.id;
  //         connectPool.query(
  //           sqlupdate,
  //           fieldsToUpdate,
  //           function (error, []) {
  //             if (error) {
  //               req.flash("error", error);
  //               return res.redirect("/edit_testimonial/" + req.body.id);
  //             }
  //             req.flash(
  //               "success",
  //               "Testimonial has been updated successfully!"
  //             );
  //             return res.redirect("/view_testimonial");
  //           }
  //         );
  //       } else {
  //         let sql =
  //           "SELECT * FROM testimonial WHERE id = " + req.body.id + " LIMIT 1";
  //         connectPool.query(sql, (error, [], fields) => {
  //           if (error) {
  //             req.flash("error", error);
  //             return res.redirect("/view_testimonial");
  //           }
  //           return res.render("edit_testimonial", {
  //             title: "Edit Testimonial",
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
