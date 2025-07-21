const { query } = require("./db.connection");
const queries = require("./queries/blogCategories.queries");

exports.getAllBlogCategories = async (limit, offset) => {
  const optimizedQuery = `${queries.GET_ALL_BLOG_CATEGORY} LIMIT ${limit} OFFSET ${offset};`;
  return query(optimizedQuery);
};

exports.countBlogCategory = async () => {
  const row = await query(queries.COUNT_BLOG_CATEGORY);
  return row[0];
};

exports.getBlogCategoryById = async (id) => {
  const row = await query(queries.GET_BLOG_CATEGORY_BY_ID, [id]);
  return row[0];
};

exports.getBlogCategoryByName = async (name) => {
  const row = await query(queries.GET_BLOG_CATEGORY_BY_NAME, [name]);
  return row[0];
};

exports.createNewBlogCategory = async (category) => {
  const { name, inputtedBy } = category;
  return query(queries.CREATE_BLOG_CATEGORY, [name, inputtedBy]);
};

exports.updateBlogCategoryById = async ({ id, name }) => {
  return query(queries.UPDATE_BLOG_CATEGORY_BY_ID, [name, id]);
};

exports.updateBlogCategoryStatusById = async ({ id, status }) => {
  return query(queries.UPDATE_BLOG_CATEGORY_STATUS_BY_ID, [status, id]);
};

exports.deleteBlogCategoryById = async (id) => {
  return query(queries.DELETE_BLOG_CATEGORY_BY_ID, [id]);
};
