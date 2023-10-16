const { connectionPool } = require("./db.connection");

exports.getAllBlogs = () => {
  const sql = "SELECT * FROM blogs ORDER BY id DESC;";
  return new Promise((resolve, reject) => {
    connectionPool.query(sql, (error, results) => {
      if (error) return reject(error);

      return resolve(results);
    });
  });
};

exports.getBlogById = (blogId) => {
  const sql = "SELECT * FROM blogs WHERE id = ? LIMIT 1";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [blogId], (error, results) => {
      if (error) return reject(error);

      return resolve(results);
    });
  });
};

exports.createNewBlog = (blog = {}) => {
  const { categoryId, name, description, image, tags } = blog;
  const sql =
    "INSERT INTO blog (categorty_id, name, description, image, tags) VALUES (?,?,?,?,?)";

  return new Promise((resolve, reject) => {
    connectionPool.query(
      sql,
      [categoryId, name, description, image, tags],
      (error, results) => {
        if (error) return reject(error);

        return resolve(results);
      }
    );
  });
};

exports.updateBlogById = (blogId, updatedBlog) => {
  const { categoryId, name, description, image, tags } = updatedBlog;
  const sql =
    "UPDATE blog SET category_id = ?, name = ?, description = ?, image = ?, tags = ? WHERE id = ?";

  return new Promise((resolve, reject) => {
    connectionPool.query(
      sql,
      [categoryId, name, description, image, tags, blogId],
      (error, results) => {
        if (error) return reject(error);

        return resolve(results);
      }
    );
  });
};

exports.updateBlogStatus = (blogId, updatedStatus) => {
  const sql = "UPDATE blog SET status = ? WHERE id = ?";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [updatedStatus, blogId], (error, results) => {
      if (error) return reject(error);

      return resolve(results);
    });
  });
};
exports.deleteBlogById = (blogId) => {
  const sql = "DELETE FROM blog WHERE id = ? ";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [blogId], (error, results) => {
      if (error) return reject(error);

      return resolve(results);
    });
  });
};
