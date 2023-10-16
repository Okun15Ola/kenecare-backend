const { validationResult } = require("express-validator");
const validator = require("./helpers/validate");
const { compareSync, hashSync, genSaltSync } = require("bcryptjs");
var fs = require("fs");

// Login Page
exports.index = (req, res, next) => {
  console.log("Dashboard");
  let sql = "select COUNT(*) as total_departments from department_type";
  connectPool.query(sql, (error, results, fields) => {
    if (error) {
      req.flash("error", error);
      return res.redirect("/dashboard");
    }

    let sql1 = "select COUNT(*) as total_doctors from user where type=2";
    connectPool.query(sql1, (error1, results1, fields1) => {
      if (error1) {
        req.flash("error", error1);
        return res.redirect("/dashboard");
      }
      let sql2 = "select COUNT(*) as total_patients from user where type=1";
      connectPool.query(sql2, (error2, results2, fields2) => {
        if (error2) {
          req.flash("error", error2);
          return res.redirect("/dashboard");
        }

        var sql3 =
          'SELECT COUNT("a.*") as total_appointments, a.specialty as specialty_id, c.image as doctor_image, b.name as patient_name, c.name as doctor_name, COALESCE(d.name, "") as specialty, DATE_FORMAT(a.appointment_date, "%d %b %Y") as appointment_date, DATE_FORMAT(a.start_time, "%h:%i %p") as appointment_time, DATE_FORMAT(a.end_time, "%h:%i %p") as appointment_end_time, DATE_FORMAT(a.created_at, "%d %b %Y") as booking_date, a.consultation_fee as amount, a.booking_type, a.user_id as patient_id, a.feedback, DATE_FORMAT(a.appointment_date, "%Y-%m-%d") as appointment_date_og FROM appointment a LEFT JOIN user b ON a.user_id = b.id LEFT JOIN user c ON a.doctor_id = c.id LEFT JOIN specialization d ON c.specialization_id = d.id ORDER BY a.appointment_date DESC, a.start_time ASC';
        connectPool.query(sql3, (error3, results3, fields3) => {
          if (error3) {
            req.flash("error", error3);
            return res.redirect("/dashboard");
          }

          var sql4 = "select * from user where type=1 order by id DESC LIMIT 5";
          connectPool.query(sql4, (error4, results4, fields4) => {
            if (error4) {
              req.flash("error", error4);
              return res.redirect("/dashboard");
            }

            var patient_data = [];
            if (results4.length > 0) {
              var i = 0;
              for (var x = 0; x < results4.length; x++) {
                arr = {};
                arr = results4[x];
                var img = BASE_URL + "public/upload/placeholder.png";
                if (results4[x].image != "") {
                  var imagePath = "public/upload/user/" + results4[x].image;
                  if (fs.existsSync(imagePath)) {
                    var img =
                      BASE_URL + "public/upload/user/" + results4[x].image;
                  }
                }
                arr["patient_image"] = img;
                patient_data.push(arr);
                i++;
              }
            }

            var sql5 =
              "select a.*, b.name as specialty from user a LEFT JOIN specialization b ON a.specialization_id = b.id where a.type=2 order by a.id DESC LIMIT 5";
            connectPool.query(sql5, (error5, results5, fields5) => {
              if (error5) {
                req.flash("error", error5);
                return res.redirect("/dashboard");
              }

              var doctor_data = [];
              if (results5.length > 0) {
                var i = 0;
                for (var x = 0; x < results5.length; x++) {
                  arr = {};
                  arr = results5[x];
                  var img = BASE_URL + "public/upload/placeholder.png";
                  if (results5[x].image != "") {
                    var imagePath = "public/upload/user/" + results5[x].image;
                    if (fs.existsSync(imagePath)) {
                      var img =
                        BASE_URL + "public/upload/user/" + results5[x].image;
                    }
                  }
                  arr["doctor_image"] = img;
                  doctor_data.push(arr);
                  i++;
                }
              }

              return res.render("dashboard", {
                total_departments: results[0].total_departments,
                total_doctors: results1[0].total_doctors,
                total_patients: results2[0].total_patients,
                total_appointments: results3[0].total_appointments,
                patients: patient_data,
                doctors: doctor_data,
                title: "Dashboard",
              });
            });
          });
        });
      });
    });
  });
};

exports.profile = (req, res) => {
  connectPool.query(
    "SELECT * FROM admin WHERE id = " + session_user_id,
    (error, results, fields) => {
      if (error) {
        req.flash("error", error);
        return res.redirect("/dashboard");
      }
      return res.render("profile", {
        title: "Profile",
        data: results,
        success: req.flash("success"),
      });
    }
  );
};

exports.profile_edit = (req, res) => {
  const body = req.body;
  const validationRule = {
    name: "required",
    email: "required",
  };
  validator(req.body, validationRule, {}, (err, status) => {
    if (status) {
      var fieldsToUpdate = {};
      fieldsToUpdate["name"] = req.body.name;
      fieldsToUpdate["email"] = req.body.email;
      var sqlupdate = "UPDATE admin SET ? WHERE id  = " + session_user_id;
      connectPool.query(sqlupdate, fieldsToUpdate, function (error, results) {
        if (error) {
          req.flash("error", error);
          return res.redirect("/profile/");
        }
        req.flash("success", "Profile has been updated successfully!");
        return res.redirect("/profile");
      });
    } else {
      connectPool.query(
        "SELECT * FROM admin WHERE id = " + session_user_id,
        (error, results, fields) => {
          if (error) {
            req.flash("error", error);
            return res.redirect("/dashboard");
          }

          return res.render("profile", {
            title: "Profile",
            data: results,
            err: err,
          });
        }
      );
    }
  });
};

exports.change_password = (req, res) => {
  return res.render("change_password", {
    title: "Change Password",
    success: req.flash("success"),
    error: req.flash("error"),
  });
};

exports.update_password = (req, res) => {
  const body = req.body;
  const validationRule = {
    opassword: "required",
    npassword: "required",
    cpassword: "required",
  };
  const validationMsg = {
    "required.opassword": "The Old Password field is required.",
    "required.npassword": "The New Password field is required.",
    "required.cpassword": "The Confirm Password  field is required.",
  };
  validator(req.body, validationRule, validationMsg, (err, status) => {
    if (status) {
      var opassword = body.opassword;
      var npassword = body.npassword;
      var cpassword = body.cpassword;
      if (npassword == cpassword) {
        connectPool.query(
          "SELECT * FROM admin WHERE id = " + session_user_id,
          (error, results, fields) => {
            if (results.length > 0) {
              const checkPass = compareSync(opassword, results[0].password);

              if (checkPass === true) {
                const salt = genSaltSync(10);
                npassword = hashSync(npassword, salt);
                var fieldsToUpdate = {};
                fieldsToUpdate["password"] = npassword;
                var sqlupdate =
                  "UPDATE admin SET ? WHERE id  = " + session_user_id;
                connectPool.query(
                  sqlupdate,
                  fieldsToUpdate,
                  function (errors, results) {
                    if (errors) {
                      req.flash("error", errors);
                      return res.redirect("/change_password");
                    }
                    req.flash("success", "Password Update Successfully!");
                    return res.redirect("/change_password");
                  }
                );
              } else {
                req.flash("error", "Wrong Old Password!");
                return res.redirect("/change_password");
              }
            } else {
              req.flash("error", "User not found!");
              return res.redirect("/change_password");
            }
          }
        );
      } else {
        req.flash("error", "New Password and Confirm Password did not match");
        return res.redirect("/change_password");
      }
    } else {
      return res.render("change_password", {
        title: "Change Password",
        err: err,
      });
    }
  });
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
  connectPool.query(sqlupdate, fieldsToUpdate, function (errors, results) {
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
