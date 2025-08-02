const { query } = require("./db.connection");
const queries = require("./queries/doctorBlogs.queries");

exports.createBlog = async ({
  blogUuid,
  doctorId,
  title,
  content,
  image,
  tags,
  status,
  publishedAt,
}) => {
  return query(queries.CREATE_BLOG, [
    blogUuid,
    doctorId,
    title,
    content,
    image,
    tags,
    status,
    publishedAt,
  ]);
};

exports.getBlogByUuid = async (blogUuid) => {
  const row = await query(queries.GET_BLOG_BY_UUID, [blogUuid]);
  return row[0];
};

exports.getBlogsByDoctorId = async (doctorId) => {
  return query(queries.GET_BLOGS_BY_DOCTOR_ID, [doctorId]);
};

exports.getPublishedBlogsByDoctor = async (doctorId) => {
  return query(queries.GET_PUBLISHED_BLOGS_BY_DOCTOR, [doctorId]);
};

exports.countPublishedBlogsByDoctor = async (doctorId) => {
  const row = await query(queries.COUNT_PUBLISHED_BLOGS_BY_DOCTOR, [doctorId]);
  return row[0];
};

exports.updateBlog = async ({
  doctorId,
  blogUuid,
  title,
  content,
  image,
  tags,
  status,
  publishedAt,
}) => {
  return query(queries.UPDATE_BLOG, [
    title,
    content,
    image,
    tags,
    status,
    publishedAt,
    doctorId,
    blogUuid,
  ]);
};

exports.updateBlogStatus = async (status, doctorId, blogUuid) => {
  let result;
  if (status === "published") {
    result = await query(queries.PUBLISH_BLOG, [doctorId, blogUuid]);
  }
  result = await query(queries.ARCHIVE_BLOG, [doctorId, blogUuid]);
  return result;
};

exports.publishScheduledBlogs = async () => {
  return query(queries.PUBLISH_SCHEDULED_BLOGS);
};

exports.deleteBlog = async (doctorId, blogUuid) => {
  return query(queries.DELETE_BLOG, [doctorId, blogUuid]);
};
