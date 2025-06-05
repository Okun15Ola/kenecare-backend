const { query } = require("./db.connection");
const queries = require("./queries/blogs.queries");

exports.getAllBlogs = async () => {
  return query(queries.GET_ALL_BLOG);
};

exports.getBlogById = async (id) => {
  const row = await query(queries.GET_BLOG_BY_ID, [id]);
  return row[0];
};

exports.createNewBlog = async (blog) => {
  const { category, title, content, image, tags, featured, inputtedBy } = blog;
  return query(queries.CREATE_BLOG, [
    category,
    title,
    content,
    image,
    tags,
    featured,
    inputtedBy,
  ]);
};

exports.updateBlogById = async ({
  id,
  category,
  title,
  content,
  tags,
  file,
  featured,
}) => {
  return query(queries.UPDATE_BLOG_BY_ID, [
    category,
    title,
    content,
    tags,
    file,
    featured,
    id,
  ]);
};

exports.updateBlogStatusById = ({ id, status }) => {
  return query(queries.UPDATE_BLOG_STATUS_BY_ID, [status, id]);
};

exports.updateBlogFeaturedById = ({ id, status }) => {
  return query(queries.UPDATE_BLOG_FEATURED_BY_ID, [status, id]);
};

exports.deleteBlogById = (id) => {
  return query(queries.DELETE_BLOG_BY_ID, [id]);
};
