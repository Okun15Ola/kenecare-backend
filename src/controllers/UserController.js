const { validationResult } = require("express-validator");
const validator = require("./helpers/validate");

exports.view_user = (req, res, next) => {
  res.render("view_user", {
    title: "User",
    data: [],
    success: req.flash("success"),
    error: req.flash("error"),
  });
  // connectPool.query(
  //           'select * from user where type=1 order by id DESC', (error, [], fields) => {
  // 		if (error) {
  // 			return res.render('view_user', {
  // 				title: 'Manage User',
  // 				error:error,
  // 				data: []
  // 			});
  // 		}
  // 		res.render("view_user", {
  // 			title: 'User',
  // 			data: [],
  // 			success:req.flash('success'),
  // 			error:req.flash('error'),
  // 		});
  //  });
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
  res.render("view_doctor", {
    title: "Manage Doctor",
    data: [],
    success: req.flash("success"),
    error: req.flash("error"),
  });
  // connectPool.query(
  //   "select * from user where type=2 order by id DESC",
  //   (error, [], fields) => {
  //     if (error) {
  //       return res.render("view_doctor", {
  //         title: "Manage Doctor",
  //         error: error,
  //         data: [],
  //       });
  //     }
  //     res.render("view_doctor", {
  //       title: "Manage Doctor",
  //       data: [],
  //       success: req.flash("success"),
  //       error: req.flash("error"),
  //     });
  //   }
  // );
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
