// const { validationResult } = require("express-validator");
const validator = require("./helpers/validate");
const { compareSync, hashSync, genSaltSync } = require("bcryptjs");
// var fs = require("fs");

// Login Page
exports.index = (req, res, next) => {
  console.log("Dashboard");
  return res.render("dashboard", {
    total_departments: 100,
    total_doctors: 100,
    total_patients: 100,
    total_appointments: 100,
    patients: [],
    doctors: [],
    title: "Dashboard",
  });
};

exports.profile = (req, res) => {
  return res.render("profile", {
    title: "Profile",
    data: [],
    success: req.flash("success"),
  });
  // connectPool.query(
  //   "SELECT * FROM admin WHERE id = " + session_user_id,
  //   (error, [], fields) => {
  //     if (error) {
  //       req.flash("error", error);
  //       return res.redirect("/dashboard");
  //     }

  //   }
  // );
};

exports.profile_edit = (req, res) => {
  return res.render("profile", {
    title: "Profile",
    data: [],
    err: [],
  });
  // const body = req.body;
  // const validationRule = {
  //   name: "required",
  //   email: "required",
  // };
  // validator(req.body, validationRule, {}, (err, status) => {
  //   if (status) {
  //     var fieldsToUpdate = {};
  //     fieldsToUpdate["name"] = req.body.name;
  //     fieldsToUpdate["email"] = req.body.email;
  //     var sqlupdate = "UPDATE admin SET ? WHERE id  = " + session_user_id;
  //     connectPool.query(sqlupdate, fieldsToUpdate, function (error, []) {
  //       if (error) {
  //         req.flash("error", error);
  //         return res.redirect("/profile/");
  //       }
  //       req.flash("success", "Profile has been updated successfully!");
  //       return res.redirect("/profile");
  //     });
  //   } else {
  //     connectPool.query(
  //       "SELECT * FROM admin WHERE id = " + session_user_id,
  //       (error, [], fields) => {
  //         if (error) {
  //           req.flash("error", error);
  //           return res.redirect("/dashboard");
  //         }

  //         return res.render("profile", {
  //           title: "Profile",
  //           data: [],
  //           err: err,
  //         });
  //       }
  //     );
  //   }
  // });
};

exports.change_password = (req, res) => {
  return res.render("change_password", {
    title: "Change Password",
    success: req.flash("success"),
    error: req.flash("error"),
  });
};

exports.update_password = (req, res) => {
  return res.render("change_password", {
    title: "Change Password",
    err: err,
  });
  // const body = req.body;
  // const validationRule = {
  //   opassword: "required",
  //   npassword: "required",
  //   cpassword: "required",
  // };
  // const validationMsg = {
  //   "required.opassword": "The Old Password field is required.",
  //   "required.npassword": "The New Password field is required.",
  //   "required.cpassword": "The Confirm Password  field is required.",
  // };
  // validator(req.body, validationRule, validationMsg, (err, status) => {
  //   if (status) {
  //     var opassword = body.opassword;
  //     var npassword = body.npassword;
  //     var cpassword = body.cpassword;
  //     if (npassword == cpassword) {
  //       connectPool.query(
  //         "SELECT * FROM admin WHERE id = " + session_user_id,
  //         (error, [], fields) => {
  //           if ([].length > 0) {
  //             const checkPass = compareSync(opassword, [][0].password);

  //             if (checkPass === true) {
  //               const salt = genSaltSync(10);
  //               npassword = hashSync(npassword, salt);
  //               var fieldsToUpdate = {};
  //               fieldsToUpdate["password"] = npassword;
  //               var sqlupdate =
  //                 "UPDATE admin SET ? WHERE id  = " + session_user_id;
  //               connectPool.query(
  //                 sqlupdate,
  //                 fieldsToUpdate,
  //                 function (errors, []) {
  //                   if (errors) {
  //                     req.flash("error", errors);
  //                     return res.redirect("/change_password");
  //                   }
  //                   req.flash("success", "Password Update Successfully!");
  //                   return res.redirect("/change_password");
  //                 }
  //               );
  //             } else {
  //               req.flash("error", "Wrong Old Password!");
  //               return res.redirect("/change_password");
  //             }
  //           } else {
  //             req.flash("error", "User not found!");
  //             return res.redirect("/change_password");
  //           }
  //         }
  //       );
  //     } else {
  //       req.flash("error", "New Password and Confirm Password did not match");
  //       return res.redirect("/change_password");
  //     }
  //   } else {
  //     return res.render("change_password", {
  //       title: "Change Password",
  //       err: err,
  //     });
  //   }
  // });
};

exports.change_status = (req, res) => {
  const body = req.body;

  var id_name = body.id_name;
  var id = body.id;
  var field_name = body.field_name;
  var status = body.status;
  var table = body.table;

  var fieldsToUpdate = {};
  fieldsToUpdate[field_name] = status;
  var sqlupdate = "UPDATE " + table + " SET ? WHERE " + id_name + "  = " + id;
  connectPool.query(sqlupdate, fieldsToUpdate, function (errors, []) {
    if (errors) {
      return res.status(200).json({
        status: "success",
        data: 1,
      });
    }
    return res.status(200).json({
      status: "success",
      data: 1,
    });
  });
};
