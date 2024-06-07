const { connectionPool } = require("./db.connection");

exports.getAllFaqs = () => {
  const sql = "SELECT * FROM blogs;";
  return new Promise((resolve, reject) => {
    connectionPool.query(sql, (error, results) => {
      if (error) return reject(error);

      return resolve(results);
    });
  });
};

exports.getFaqById = (id) => {
  const sql = "SELECT * FROM blogs WHERE blog_id = ? LIMIT 1";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [id], (error, results) => {
      if (error) return reject(error);

      return resolve(results[0]);
    });
  });
};

exports.createNewFaq = (blog) => {
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

exports.updateFaqById = ({ id, blog }) => {
  const { category, title, content, image, tags, featured } = blog;
  const sql =
    "UPDATE blogs SET blog_category_id = ?, title = ?, description = ?, image = ?, tags = ?, is_featured = ? WHERE blog_id = ?";

  return new Promise((resolve, reject) => {
    connectionPool.query(
      sql,
      [category, title, content, image, tags, featured, id],
      (error, results) => {
        if (error) return reject(error);

        return resolve(results);
      },
    );
  });
};

exports.updateFaqStatusById = ({ id, status }) => {
  const sql = "UPDATE blogs SET is_active = ? WHERE blog_id = ?";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [status, id], (error, results) => {
      if (error) return reject(error);

      return resolve(results);
    });
  });
};

exports.deleteFaqById = (id) => {
  const sql = "DELETE FROM blogs WHERE blog_id = ? ";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [id], (error, results) => {
      if (error) return reject(error);

      return resolve(results);
    });
  });
};
