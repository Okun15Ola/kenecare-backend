const { connectionPool } = require("./db.connection");

exports.getAllBlogCategories = () => {
  const sql = "SELECT * FROM blog_categories";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, (error, results) => {
      if (error) return reject(error);

      return resolve(results);
    });
  });
};

exports.getBlogCategoryById = (id) => {
  const sql = "SELECT * FROM blog_categories WHERE category_id = ? LIMIT 1";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [id], (error, results) => {
      if (error) return reject(error);

      return resolve(results[0]);
    });
  });
};
exports.getBlogCategoryByName = (name) => {
  const sql = "SELECT * FROM blog_categories WHERE category_name = ? LIMIT 1";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [name], (error, results) => {
      if (error) return reject(error);

      return resolve(results[0]);
    });
  });
};

exports.createNewBlogCategory = (category) => {
  const { name, inputtedBy } = category;
  const sql =
    "INSERT INTO blog_categories (category_name, inputted_by) VALUES (?,?);";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [name, inputtedBy], (error, results) => {
      if (error) return reject(error);

      return resolve(results);
    });
  });
};

exports.updateBlogCategoryById = ({ id, name }) => {
  const sql =
    "UPDATE blog_categories SET category_name = ? WHERE category_id = ?";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [name, id], (error, results) => {
      if (error) return reject(error);

      return resolve(results);
    });
  });
};

exports.updateBlogCategoryStatusById = ({ id, status }) => {
  const sql = "UPDATE blog_categories SET is_active = ? WHERE category_id = ?";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [status, id], (error, results) => {
      if (error) return reject(error);

      return resolve(results);
    });
  });
};

exports.deleteBlogCategoryById = (id) => {
  const sql = "DELETE FROM blog_categories WHERE category_id = ?";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [id], (error, results) => {
      if (error) return reject(error);

      return resolve(results);
    });
  });
};
