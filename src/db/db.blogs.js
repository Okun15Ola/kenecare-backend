const { connectionPool } = require("./db.connection");

exports.getAllBlogs = () => {
  const sql =
    "SELECT blog_id, category_name,title,description,image, tags, fullname as 'author', blogs.is_active, blogs.is_featured,blogs.created_at FROM blogs INNER JOIN blog_categories ON blogs.blog_category_id = blog_categories.category_id INNER JOIN admins on blogs.inputted_by = admins.admin_id;";
  return new Promise((resolve, reject) => {
    connectionPool.query(sql, (error, results) => {
      if (error) return reject(error);

      return resolve(results);
    });
  });
};

exports.getBlogById = (id) => {
  const sql =
    "SELECT blog_id, category_name,title,description,image, tags, fullname as 'author', blogs.is_active, blogs.is_featured,blogs.created_at FROM blogs INNER JOIN blog_categories ON blogs.blog_category_id = blog_categories.category_id INNER JOIN admins on blogs.inputted_by = admins.admin_id WHERE blog_id = ? LIMIT 1";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [id], (error, results) => {
      if (error) return reject(error);

      return resolve(results[0]);
    });
  });
};

exports.createNewBlog = (blog) => {
  const { category, title, content, image, tags, featured, inputtedBy } = blog;
  const sql =
    "INSERT INTO blogs (blog_category_id, title, description, image, tags,is_featured, inputted_by) VALUES (?,?,?,?,?,?,?)";

  return new Promise((resolve, reject) => {
    connectionPool.query(
      sql,
      [category, title, content, image, tags, featured, inputtedBy],
      (error, results) => {
        if (error) return reject(error);

        return resolve(results);
      },
    );
  });
};

exports.updateBlogById = ({
  id,
  category,
  title,
  content,
  tags,
  file,
  featured,
}) => {
  const sql =
    "UPDATE blogs SET blog_category_id = ?, title = ?, description = ?, image = ?, tags = ?, is_featured = ? WHERE blog_id = ?";

  return new Promise((resolve, reject) => {
    connectionPool.query(
      sql,
      [category, title, content, file, tags, featured, id],
      (error, results) => {
        if (error) return reject(error);

        return resolve(results);
      },
    );
  });
};

exports.updateBlogStatusById = ({ id, status }) => {
  const sql = "UPDATE blogs SET is_active = ? WHERE blog_id = ?";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [status, id], (error, results) => {
      if (error) return reject(error);

      return resolve(results);
    });
  });
};
exports.updateBlogFeaturedById = ({ id, status }) => {
  const sql = "UPDATE blogs SET is_featured = ? WHERE blog_id = ?";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [status, id], (error, results) => {
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
