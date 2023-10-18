const { validationResult } = require("express-validator");
const validator = require("./helpers/validate");
var multer = require("multer");
var fs = require("fs");
const callfun = require("./helpers/msgget");

/* const htmlentities = {
	encode : function(str) {
		var buf = [];
		
		for (var i=str.length-1;i>=0;i--) {
			buf.unshift(['&#', str[i].charCodeAt(), ';'].join(''));
		}
		
		return buf.join('');
	},
	decode : function(str) {
		return str.replace(/&#(\d+);/g, function(match, dec) {
			return String.fromCharCode(dec);
		});
	}
}; */

const { getTragos } = require("./helpers/msgget");

// const {html_entity_encode} = require("./helpers/html_entities");

exports.view_blog = (req, res, next) => {
  return res.render("view_blog", {
    title: "Blog",
    data: [],
    success: req.flash("success"),
    error: req.flash("error"),
  });
  connectPool.query(
    "select * from blog order by id DESC",
    (error, results, fields) => {
      if (error) {
        return res.render("view_blog", {
          title: "Manage Blog",
          error: error,
          data: [],
        });
      }

      var ids = results;
      getTragos(ids, function (students) {
        res.render("view_blog", {
          title: "Blog",
          data: students,
          success: req.flash("success"),
          error: req.flash("error"),
        });
      });
    }
  );
};

exports.add_blog = (req, res, next) => {
  res.render("add_blog", {
    title: "Blog",
    success: req.flash("success"),
    error: req.flash("error"),
    category: [],
  });
  // connectPool.query(
  //   "select * from blog_category where status=1 order by id DESC",
  //   (error, results, fields) => {
  //     if (error) {
  //       req.flash("error", error);
  //       return res.redirect("/view_blog");
  //     }
  //     res.render("add_blog", {
  //       title: "Blog",
  //       success: req.flash("success"),
  //       error: req.flash("error"),
  //       category: results,
  //     });
  //   }
  // );
};

var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./public/upload/blog");
  },
  filename: function (req, file, callback) {
    let extArray = file.originalname.split(".");
    let extension = extArray[extArray.length - 1];
    callback(null, file.fieldname + "-" + Date.now() + "." + extension);
  },
});
var upload = multer({ storage: storage }).single("image");

exports.do_add_blog = (req, res, next) => {
  return res.render("add_blog", {
    err: err,
    title: "Blog",
    category_id: "",
    name: "",
    description: "",
    tags: "",
    category: [],
  });
  upload(req, res, function (err) {
    if (req.file) {
      const validationRule = {
        category_id: "required",
        name: "required",
        description: "required",
        tags: "required",
      };
      validator(req.body, validationRule, {}, (err, status) => {
        if (status) {
          var category_id = req.body.category_id;
          var name = html_entities.encode(req.body.name);
          var description = html_entities.encode(req.body.description);
          var prof_pic = req.file.filename;
          var tags = req.body.tags;

          var insQry =
            "INSERT INTO blog SET category_id = '" +
            category_id +
            "',name = '" +
            name +
            "',description = '" +
            description +
            "', image = '" +
            prof_pic +
            "', tags = '" +
            tags +
            "'";

          connectPool.query(insQry, (error, results, fields) => {
            if (error) {
              req.flash("error", error.sqlMessage);
              return res.redirect("/view_blog");
            }
            id = results.insertId;
            req.flash("success", "Blog has been saved successfully!");
            return res.redirect("/view_blog");
          });
        } else {
          connectPool.query(
            "select * from blog_category where status=1 order by id DESC",
            (error, results, fields) => {
              if (error) {
                req.flash("error", error);
                return res.redirect("/view_blog");
              }
              res.render("add_blog", {
                err: err,
                title: "Blog",
                category_id: req.body.category_id,
                name: req.body.name,
                description: req.body.description,
                tags: req.body.tags,
                category: results,
              });
            }
          );
        }
      });
    } else {
      connectPool.query(
        "select * from blog_category where status=1 order by id DESC",
        (error, results, fields) => {
          if (error) {
            req.flash("error", error);
            return res.redirect("/view_blog");
          }
          res.render("add_blog", {
            err: err,
            title: "Blog",
            category_id: req.body.category_id,
            name: req.body.name,
            description: req.body.description,
            tags: req.body.tags,
            imageval: "image field required",
            category: results,
          });
        }
      );
    }
  });
};

exports.edit_blog = (req, res) => {
  return res.render("edit_blog", {
    title: "Edit Blog",
    success: req.flash("success"),
    error: [],
    data: [],
    category: [],
  });
  var id = req.params.id;
  let sql = "SELECT * FROM blog WHERE id = " + id + " LIMIT 1";
  connectPool.query(sql, (error, results, fields) => {
    if (error) {
      connectPool.query(
        "select * from blog_category where status=1 order by id DESC",
        (errors, result, fields) => {
          if (errors) {
            req.flash("error", errors);
            return res.redirect("/view_blog");
          }
          res.render("edit_blog", {
            title: "Edit Blog",
            success: req.flash("success"),
            error: error,
            data: [],
            category: result,
          });
        }
      );
    }

    connectPool.query(
      "select * from blog_category where status=1 order by id DESC",
      (errors, result, fields) => {
        if (errors) {
          req.flash("error", errors);
          return res.redirect("/view_blog");
        }
        res.render("edit_blog", {
          title: "Edit Blog",
          data: results,
          success: req.flash("success"),
          error: req.flash("error"),
          category: result,
        });
      }
    );
  });
};

exports.delete_blog = (req, res) => {
  const id = req.params.id;

  let sql = "SELECT * FROM blog WHERE id = " + id + " LIMIT 1";
  connectPool.query(sql, (error, results, fields) => {
    if (error) {
      req.flash("error", error);
      return res.redirect("/view_blog");
    }
    if (results.length > 0) {
      connectPool.query(
        'DELETE FROM blog WHERE id = "' + id + '" ',
        (errors, result, fields) => {
          if (errors) {
            return res.render("view_blog", {
              title: "Manage Blog",
              error: errors,
            });
          }
          var imagePath = "public/upload/blog/" + results[0].image;
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
          req.flash("success", "Blog Delete Successfully!");
          return res.redirect("/view_blog");
        }
      );
    }
  });
};
exports.do_edit_blog = (req, res) => {
  return res.render("edit_blog", {
    title: "Edit Blog",
    success: req.flash("success"),
    error: [],
    data: [],
    category: [],
  });
  upload(req, res, function (err) {
    if (req.file) {
      const validationRule = {
        category_id: "required",
        name: "required",
        description: "required",
        tags: "required",
      };
      validator(req.body, validationRule, {}, (err, status) => {
        if (status) {
          let sql = "SELECT * FROM blog WHERE id = " + req.body.id + " LIMIT 1";
          connectPool.query(sql, (errors, result, fields) => {
            if (errors) {
              req.flash("error", errors);
              return res.redirect("/view_blog");
            }
            if (result.length > 0) {
              var imagePath = "public/upload/blog/" + result[0].image;
              if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
              }
              var fieldsToUpdate = {};
              fieldsToUpdate["category_id"] = req.body.category_id;
              fieldsToUpdate["name"] = req.body.name;
              fieldsToUpdate["tags"] = req.body.tags;
              fieldsToUpdate["description"] = req.body.description;
              fieldsToUpdate["image"] = req.file.filename;

              var sqlupdate = "UPDATE blog SET ? WHERE id  = " + req.body.id;
              connectPool.query(
                sqlupdate,
                fieldsToUpdate,
                function (error, results) {
                  if (error) {
                    req.flash("error", error);
                    return res.redirect("/edit_blog/" + req.body.id);
                  }
                  req.flash("success", "Blog has been updated successfully!");
                  return res.redirect("/view_blog");
                }
              );
            } else {
              return res.redirect("/view_blog");
            }
          });
        } else {
          let sql = "SELECT * FROM blog WHERE id = " + req.body.id + " LIMIT 1";
          connectPool.query(sql, (error, results, fields) => {
            if (error) {
              connectPool.query(
                "select * from blog_category where status=1 order by id DESC",
                (errors, result, fields) => {
                  if (errors) {
                    req.flash("error", errors);
                    return res.redirect("/view_blog");
                  }
                  res.render("edit_blog", {
                    title: "Edit Blog",
                    success: req.flash("success"),
                    error: error,
                    data: [],
                    category: result,
                  });
                }
              );
            }

            connectPool.query(
              "select * from blog_category where status=1 order by id DESC",
              (errors, result, fields) => {
                if (errors) {
                  req.flash("error", errors);
                  return res.redirect("/view_blog");
                }
                res.render("edit_blog", {
                  title: "Edit Blog",
                  data: results,
                  success: req.flash("success"),
                  error: req.flash("error"),
                  err: err,
                  category: result,
                });
              }
            );
          });
        }
      });
    } else {
      const validationRule = {
        category_id: "required",
        name: "required",
        description: "required",
        tags: "required",
      };
      validator(req.body, validationRule, {}, (err, status) => {
        if (status) {
          var fieldsToUpdate = {};
          fieldsToUpdate["category_id"] = req.body.category_id;
          fieldsToUpdate["name"] = req.body.name;
          fieldsToUpdate["tags"] = req.body.tags;
          fieldsToUpdate["description"] = req.body.description;
          var sqlupdate = "UPDATE blog SET ? WHERE id  = " + req.body.id;
          connectPool.query(
            sqlupdate,
            fieldsToUpdate,
            function (error, results) {
              if (error) {
                req.flash("error", error);
                return res.redirect("/edit_blog/" + req.body.id);
              }
              req.flash("success", "Blog has been updated successfully!");
              return res.redirect("/view_blog");
            }
          );
        } else {
          let sql = "SELECT * FROM blog WHERE id = " + req.body.id + " LIMIT 1";
          connectPool.query(sql, (error, results, fields) => {
            if (error) {
              connectPool.query(
                "select * from blog_category where status=1 order by id DESC",
                (errors, result, fields) => {
                  if (errors) {
                    req.flash("error", errors);
                    return res.redirect("/view_blog");
                  }
                  res.render("edit_blog", {
                    title: "Edit Blog",
                    success: req.flash("success"),
                    error: error,
                    data: [],
                    category: result,
                  });
                }
              );
            }
            connectPool.query(
              "select * from blog_category where status=1 order by id DESC",
              (errors, result, fields) => {
                if (errors) {
                  req.flash("error", errors);
                  return res.redirect("/view_blog");
                }
                res.render("edit_blog", {
                  title: "Edit Blog",
                  data: results,
                  success: req.flash("success"),
                  error: req.flash("error"),
                  err: err,
                  category: result,
                });
              }
            );
          });
        }
      });
    }
  });
};
