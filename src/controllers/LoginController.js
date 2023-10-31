const { validationResult } = require("express-validator");
const validator = require("./helpers/validate");
const { compareSync, hashSync, genSaltSync } = require("bcryptjs");

// Login Page
exports.login = (req, res, next) => {
  return res.render("login", {
    title: "Login",
    success: req.flash("success"),
    error: req.flash("error"),
    layout: false
  });
};

exports.do_login = (req, res, next) => {
  const { body } = req;

  const validationRule = {
    email: "required|email",
    password: "required",
  };
  validator(req.body, validationRule, {}, (err, status) => {
    if (status) {
      try {
        var email = body.email;
        var password = body.password;
        if (email) {
          connectPool.query(
            "SELECT * FROM admin WHERE email = ?",
            [email],
            function (error, results, fields) {
              if (error) {
                req.flash("error", error.sqlMessage);
                return res.redirect("/login");
              }
              if (results.length > 0) {
                const checkPass = compareSync(password, results[0].password);

                if (checkPass === true) {
                  req.session.userID = results[0].id;
                  req.session.userFullName = results[0].name;
                  return res.redirect("/dashboard");
                }
                req.flash("error", "Invalid Password.");
                return res.redirect("/login");
              } else {
                req.flash("error", "Incorrect Username.");
                return res.redirect("/login");
              }
            }
          );
        } else {
          req.flash("error", "Please enter Username and Password.");
          return res.redirect("/login");
        }
      } catch (e) {
        next(e);
      }
    } else {
      console.log(err);
      res.render("login", {
        err: err.message,
        title: "Login",
      });
    }
  });
};

exports.forgot_password = (req, res, next) => {
  res.render("forgot_password", {
    title: "Forgot Password",
    error: req.flash("error"),
    success: req.flash("success"),
  });
};

exports.reset_link = (req, res, next) => {
  const { body } = req;

  const validationRule = {
    email: "required|email",
  };
  var email = body.email;
  validator(req.body, validationRule, {}, (err, status) => {
    if (status) {
      connectPool.query(
        "SELECT * FROM admin WHERE email = ?",
        [email],
        function (error, results, fields) {
          if (error) {
            req.flash("error", error);
            return res.redirect("/forgot_password");
          }
          if (results.length > 0) {
            var token = Math.floor(Math.random() * 900000) + 100000;
            var fieldsToUpdate = {};
            fieldsToUpdate["token"] = token;
            var sqlupdate = "UPDATE admin SET ? WHERE id  = " + results[0].id;
            connectPool.query(
              sqlupdate,
              fieldsToUpdate,
              function (errors, result) {
                if (errors) {
                  req.flash("error", errors);
                  return res.redirect("/forgot_password/");
                }
                var linkred = BASE_URL + "reset_password/" + token;
                var html =
                  '<p>Please click on below password reset link <a target="_blank" href="' +
                  linkred +
                  '">Reset Password</a></p>';

                var mailOptions = {
                  from: "kishan.jdinfotech@gmail.com",
                  to: results[0].email,
                  subject: "Forgot Password",
                  html: html,
                };

                mailerConfig.sendMail(
                  mailOptions,
                  function (mailError, mailInfo) {
                    if (mailError) {
                      req.flash("error", mailError.response);
                      return res.redirect("/forgot_password/");
                    }
                    req.flash(
                      "success",
                      "Email sent successfully. Check Your Mail..."
                    );
                    return res.redirect("/forgot_password");
                  }
                );
              }
            );
          } else {
            req.flash("error", "Incorrect Email.");
            return res.redirect("/forgot_password");
          }
        }
      );
    } else {
      //console.log(err.errors.email);
      res.render("forgot_password", {
        err: err,
        title: "Forgot Password",
        email: email,
      });
    }
  });
};

exports.reset_password = (req, res, next) => {
  return res.render("reset_password", {
    title: "Reset Password",
    token: token,
    error: req.flash("error"),
    success: req.flash("success"),
  });
};

exports.update_password = (req, res, next) => {
  return res.render("reset_password", {
    title: "Reset Password",
    token: body.token,
    err: err,
  });
};
