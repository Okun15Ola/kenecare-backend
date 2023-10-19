const { connectionPool } = require("./db.connection");

exports.getAllBlogs = () => {
  const sql = "SELECT * FROM blogs;";
  return new Promise((resolve, reject) => {
    connectionPool.query(sql, (error, results) => {
      if (error) return reject(error);

      return resolve(results);
    });
  });
};

exports.getBlogById = (id) => {
  const sql = "SELECT * FROM blogs WHERE blog_id = ? LIMIT 1";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [id], (error, results) => {
      if (error) return reject(error);

      return resolve(results[0]);
    });
  });
};

exports.createNewBlog = (blog) => {
  const { category, title, content, image, tags,featured,inputtedBy } = blog;
  const sql =
    "INSERT INTO blogs (blog_category_id, title, description, image, tags,is_featured, inputted_by) VALUES (?,?,?,?,?,?,?)";

  return new Promise((resolve, reject) => {
    connectionPool.query(
      sql,
      [category, title, content, image, tags,featured,inputtedBy],
      (error, results) => {
        if (error) return reject(error);

        return resolve(results);
      }
    );
  });
};

exports.updateBlogById = ({id, blog}) => {
  const { category, title, content, image, tags,featured } = blog;
  const sql =
    "UPDATE blogs SET blog_category_id = ?, title = ?, description = ?, image = ?, tags = ?, is_featured = ? WHERE blog_id = ?";

  return new Promise((resolve, reject) => {
    connectionPool.query(
      sql,
      [category, title, content, image, tags,featured, id],
      (error, results) => {
        if (error) return reject(error);

        return resolve(results);
      }
    );
  });
};

exports.updateBlogStatusById = ({id, status}) => {
  const sql = "UPDATE blogs SET is_active = ? WHERE blog_id = ?";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [status,id], (error, results) => {
      if (error) return reject(error);

      return resolve(results);
    });
  });
};
exports.updateBlogFeaturedById = ({id, status}) => {
  const sql = "UPDATE blogs SET is_featured = ? WHERE blog_id = ?";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [status,id], (error, results) => {
      if (error) return reject(error);

      return resolve(results);
    });
  });
};
exports.deleteBlogById = (id) => {
  const sql = "DELETE FROM blogs WHERE blog_id = ? ";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [id], (error, results) => {
      if (error) return reject(error);

      return resolve(results);
    });
  });
};
