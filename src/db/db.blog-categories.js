const { connectionPool } = require("./db.connection");

exports.getAllBlogCategories = () => {
  const sql = "SELECT * FROM blog_category ORDER BY id DESC";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, (error, results) => {
      if (error) return reject(error);

      return resolve(results);
    });
  });
};

exports.getBlogCategoryById = (blogCategoryId) => {
  const sql = "SELECT * FROM blog_category WHERE id = ? LIMIT 1";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [blogCategoryId], (error, results) => {
      if (error) return reject(error);

      return resolve(results);
    });
  });
};

exports.createNewBlogCategory = (blogCategory) => {
  const { categoryName } = blogCategory;
  const sql = "INSERT INTO blog_category (name) VALUES (?) ";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [categoryName], (error, results) => {
      if (error) return reject(error);

      return resolve(results);
    });
  });
};

exports.updateBlogCategoryById = (blogCategoryId, updatedBlog) => {
  const { categoryName } = updatedBlog;
  const sql = "UPDATE blog_category SET name = ? WHERE id = ?";

  return new Promise((resolve, reject) => {
    connectionPool.query(
      sql,
      [categoryName, blogCategoryId],
      (error, results) => {
        if (error) return reject(error);

        return resolve(results);
      }
    );
  });
};
exports.updateBlogCategoryStatus = (blogCategoryId, status) => {
  const sql = "UPDATE blog_category SET status = ? WHERE id = ?";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [status, blogCategoryId], (error, results) => {
      if (error) return reject(error);

      return resolve(results);
    });
  });
};

exports.deleteBlogCategoryById = (blogCategoryId) => {
  const sql = "DELETE FROM blog_category WHERE id = ?";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [blogCategoryId], (error, results) => {
      if (error) return reject(error);

      return resolve(results);
    });
  });
};
