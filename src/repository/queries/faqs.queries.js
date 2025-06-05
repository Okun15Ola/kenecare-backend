module.exports = {
  GET_ALL_FAQS: "SELECT * FROM blogs;",
  GET_FAQ_BY_ID: "SELECT * FROM blogs WHERE blog_id = ? LIMIT 1;",
  CREATE_FAQ: `
    INSERT INTO blogs (blog_category_id, title, description, image, tags, is_featured, inputted_by)
    VALUES (?, ?, ?, ?, ?, ?, ?);
  `,
  UPDATE_FAQ_BY_ID: `
    UPDATE blogs SET blog_category_id = ?, title = ?, description = ?, image = ?, tags = ?, is_featured = ?
    WHERE blog_id = ?;
  `,
  UPDATE_FAQ_STATUS_BY_ID: `
    UPDATE blogs SET is_active = ? WHERE blog_id = ?;
  `,
  DELETE_FAQ_BY_ID: `
    DELETE FROM blogs WHERE blog_id = ?;
  `,
};
