module.exports = {
  GET_ALL_BLOG_CATEGORY: "SELECT * FROM blog_categories",
  GET_BLOG_CATEGORY_BY_ID:
    "SELECT * FROM blog_categories WHERE category_id = ? LIMIT 1",
  GET_BLOG_CATEGORY_BY_NAME:
    "SELECT * FROM blog_categories WHERE category_name = ? LIMIT 1",
  CREATE_BLOG_CATEGORY:
    "INSERT INTO blog_categories (category_name, inputted_by) VALUES (?,?);",
  UPDATE_BLOG_CATEGORY_BY_ID:
    "UPDATE blog_categories SET category_name = ? WHERE category_id = ?",
  UPDATE_BLOG_CATEGORY_STATUS_BY_ID:
    "UPDATE blog_categories SET is_active = ? WHERE category_id = ?",
  DELETE_BLOG_CATEGORY_BY_ID:
    "DELETE FROM blog_categories WHERE category_id = ?",
};
